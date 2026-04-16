package com.ajemi.barber.Ta7li9_app.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ajemi.barber.Ta7li9_app.dto.AppointmentRequestDTO;
import com.ajemi.barber.Ta7li9_app.dto.AppointmentResponseDTO;
import com.ajemi.barber.Ta7li9_app.entity.AppointmentEntity;
import com.ajemi.barber.Ta7li9_app.entity.AppointmentStatus;
import com.ajemi.barber.Ta7li9_app.entity.ServiceEntity;
import com.ajemi.barber.Ta7li9_app.entity.User;
import com.ajemi.barber.Ta7li9_app.repository.AppointmentRepository;
import com.ajemi.barber.Ta7li9_app.repository.ServiceRepository;
import com.ajemi.barber.Ta7li9_app.repository.UserRepository;
import com.ajemi.barber.Ta7li9_app.security.UserPrincipal;

@Service
public class AppointmentService {
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ServiceRepository serviceRepository;
    @Autowired 
    private SimpMessagingTemplate messagingTemplate;

    public List<User> searchClient(Long coiffeurId, String query) {
        // Stage 1: Qelleb f l-History dyalk (Prefix Search)
        // Ila ktabتي "A", kiy-jbed Amine li fayt 7ssen 3ndek   
        List<User> historyClients = appointmentRepository.findMyPastClients(coiffeurId, query);
        
        if (!historyClients.isEmpty()) {
            return historyClients;
        }

        // Stage 2: Ila malqiti walou f l-History (ya3ni jdid 3ndek)
        // Khass darori i-koun ktab nemra d t-telfon kamla (masalan 10 d l-arqam)
        if (query.matches("\\d{10}")) { 
            // Kan-mchiw l l-UserRepository n-qelbou f l-app kamla
            return userRepository.findByPhoneNumber(query)
                    .map(List::of) // Ila lqah kiy-rj3o f Lista
                    .orElse(Collections.emptyList()); // Ila malqahch kiy-rjje3 lista khawya
        }

        return Collections.emptyList();
    }
    
    @Transactional
    public AppointmentResponseDTO createAppointment(UserPrincipal currentUser, AppointmentRequestDTO dto) {
        Long currentUserId = currentUser.getId();
        boolean isClient = currentUser.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_CLIENT"));

        // 1. Check Duplicate l l-Client (Zid PENDING l l-lista dyal l-verif)
        if (isClient) {
            boolean alreadyInQueue = appointmentRepository.existsByClientIdAndStatusIn(
                currentUserId, 
                List.of(AppointmentStatus.PENDING, AppointmentStatus.WAITING, AppointmentStatus.IN_PROGRESS)
            );
            if (alreadyInQueue) {
                throw new RuntimeException("Rak dejà f n-nouba walla katti-tsenna acceptation!");
            }
        }

        AppointmentEntity appointment = new AppointmentEntity();
        User coiffeur;
        User client = null;
        String manualName = null;

        // --- Ta7did Roles ---
        if (!isClient) { // Coiffeur Manual Add
            coiffeur = userRepository.findById(currentUserId).orElseThrow(() -> new RuntimeException("Coiffeur not found"));
            if (dto.getClientId() != null) {
                client = userRepository.findById(dto.getClientId()).orElse(null);
            } else {
                manualName = dto.getManualName();
            }
            
            // Manual add kiy-koun direct WAITING u kiy-7seb n-nouba
            appointment.setStatus(AppointmentStatus.WAITING);
            setupQueueTimes(appointment, coiffeur.getId(), dto.getServiceIds());
        } 
        else { // Client Send Demand
            coiffeur = userRepository.findById(dto.getBarberId()).orElseThrow(() -> new RuntimeException("Coiffeur not found"));
            client = userRepository.findById(currentUserId).orElseThrow(() -> new RuntimeException("Client context not found"));
            
            // Demand kiy-koun PENDING u weqt khawi
            appointment.setStatus(AppointmentStatus.PENDING);
            appointment.setStartTime(null);
            appointment.setEndTime(null);
            
            // Services darouriyin wakha weqt null
            List<ServiceEntity> selectedServices = serviceRepository.findAllById(dto.getServiceIds());
            appointment.setServices(selectedServices);
        }

        appointment.setCoiffeur(coiffeur);
        appointment.setClient(client);
        appointment.setManualClientName(manualName);

        AppointmentEntity savedApp = appointmentRepository.save(appointment);
        appointmentRepository.flush();
        messagingTemplate.convertAndSend("/topic/queue/" + coiffeur.getId(), "UPDATE_QUEUE");

        return mapToResponseDTO(savedApp);
    }

    // Helper method bach mat-3awdch l-code dyal calculation
    private void setupQueueTimes(AppointmentEntity app, Long coiffeurId, List<Long> serviceIds) {
        List<ServiceEntity> services = serviceRepository.findAllById(serviceIds);
        int totalDuration = services.stream().mapToInt(ServiceEntity::getDuration).sum();
        app.setServices(services);

        // 1. Filter: ghir WAITING u IN_PROGRESS
        List<AppointmentStatus> activeStatuses = List.of(AppointmentStatus.WAITING, AppointmentStatus.IN_PROGRESS);
        
        // 2. Query
        Optional<AppointmentEntity> lastApp = appointmentRepository
                .findTopByCoiffeurIdAndStatusInOrderByEndTimeDesc(coiffeurId, activeStatuses);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime;

        // 3. Safety Check: darouri n-takkdou beli endTime machi null
        if (lastApp.isPresent() && lastApp.get().getEndTime() != null) {
            LocalDateTime lastEndTime = lastApp.get().getEndTime();
            // Ila akhir rdv salla qbel dba, bda dba. Ila baqi kheddam, bda m3ah.
            startTime = lastEndTime.isAfter(now) ? lastEndTime : now;
        } else {
            // Ma-lqina walou walla l-rdv l-akhir khawi (null), bda dba
            startTime = now;
        }

        app.setStartTime(startTime);
        app.setEndTime(startTime.plusMinutes(totalDuration));
    }

    @Transactional
    public AppointmentResponseDTO acceptAppointment(Long appointmentId) {
        AppointmentEntity app = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Demand ma-lqinahch"));

        if (app.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Had l-rdv machi pending!");
        }

        // Nadi l-helper method li gadina l-fouq bach t-7seb lih n-nouba
        List<Long> serviceIds = app.getServices().stream().map(ServiceEntity::getId).toList();
        setupQueueTimes(app, app.getCoiffeur().getId(), serviceIds);

        app.setStatus(AppointmentStatus.WAITING);
        AppointmentEntity saved = appointmentRepository.save(app);

        // Notify kolchi
        messagingTemplate.convertAndSend("/topic/queue/" + app.getCoiffeur().getId(), "UPDATE_QUEUE");

        return mapToResponseDTO(saved);
    }
    @Transactional
    public void rejectAppointment(Long appointmentId) {
        AppointmentEntity app = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Demand ma-lqinahch"));
        
        app.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(app);
        
        messagingTemplate.convertAndSend("/topic/queue/" + app.getCoiffeur().getId(), "UPDATE_QUEUE");
    }
    private AppointmentResponseDTO mapToResponseDTO(AppointmentEntity entity) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(entity.getId());
        
        // Logic dyal s-smiya: User official wala Manual
        if (entity.getClient() != null) {
            dto.setClientName(entity.getClient().getFirstName() + " " + entity.getClient().getLastName());
        } else {
            dto.setClientName(entity.getManualClientName());
        }

        dto.setServiceNames(entity.getServices().stream()
                .map(ServiceEntity::getName)
                .toList());
                
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setStatus(entity.getStatus().toString());
            // Hna t7seb total duration b minutes
        if (entity.getStartTime() != null && entity.getEndTime() != null) {
            Duration duration = Duration.between(entity.getStartTime(), entity.getEndTime());
            dto.setTotalDuration((int) duration.toMinutes()); // 7ssab minutes
        } else {
            dto.setTotalDuration(0); // ila ma kaynach dates
        }
        
        return dto;
    }
    //hadi 3la hssab updat time ila t3atal coiffeur
    @Transactional
    public void updateFutureAppointments(Long coiffeurId, LocalDateTime newEndTime) {
    // Jib ghir n-nas li kiy-tsennaw (WAITING) mn daba l-fouq
        List<AppointmentEntity> futureApps = appointmentRepository
                .findByCoiffeurIdAndStatusAndStartTimeAfterOrderByStartTimeAsc(
                    coiffeurId, 
                    AppointmentStatus.WAITING, 
                    LocalDateTime.now()
                );

        LocalDateTime currentPointer = newEndTime;

        for (AppointmentEntity app : futureApps) {
            // 2. Start time d s-sayed jid = End time d s-sayed li qbel mennu
            app.setStartTime(currentPointer);
            
            // 3. 7seb l-End time jdid 3la 7sab duration d les services dyalu
            int duration = app.getServices().stream().mapToInt(ServiceEntity::getDuration).sum();
            app.setEndTime(currentPointer.plusMinutes(duration));
            
            // 4. Pointer kiy-mchi l l-mou3id li jay
            currentPointer = app.getEndTime();
        }
        appointmentRepository.saveAll(futureApps);
    }
    //button start mn yabda
    @Transactional
    public AppointmentResponseDTO startAppointment(Long appointmentId) {
        AppointmentEntity app = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment malqinahch"));
                
        app.setStatus(AppointmentStatus.IN_PROGRESS);
        // T-qder hna t-dir update l startTime l l-waqt d dba nishan ila bghiti dqiqa
        app.setStartTime(LocalDateTime.now()); 
        
        return mapToResponseDTO(appointmentRepository.save(app));
    }

    //button done ila sala
    @Transactional
    public AppointmentResponseDTO completeAppointment(Long appointmentId) {
        AppointmentEntity app = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment malqinahch"));
                
        app.setStatus(AppointmentStatus.COMPLETED);
        app.setEndTime(LocalDateTime.now()); // Salla dba
        
        return mapToResponseDTO(appointmentRepository.save(app));
    }
    // had queeue li ychofha coiffeur la2i7at l2intidar 
    public List<AppointmentResponseDTO> getTodayQueue(Long coiffeurId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        // 1. Jib ga3 l-Appointments dyal had l-coiffeur (ga3 l-statuses li bghina)
        List<AppointmentEntity> allApps = appointmentRepository.findByCoiffeurIdAndStatusIn(
            coiffeurId, 
            List.of(AppointmentStatus.PENDING, AppointmentStatus.WAITING, AppointmentStatus.IN_PROGRESS, AppointmentStatus.COMPLETED)
        );

        // 2. Filter-i l-data f Java bach t-7ell mouchkil l-NULL u l-Dates
        List<AppointmentEntity> filteredApps = allApps.stream()
            .filter(app -> {
                // A: Ila kan PENDING, khallih y-douz (wakha startTime null)
                if (app.getStatus() == AppointmentStatus.PENDING) return true;
                
                // B: Ila kan status khor, khass darouri y-koun f lyoma
                if (app.getStartTime() != null) {
                    return !app.getStartTime().isBefore(startOfDay) && !app.getStartTime().isAfter(endOfDay);
                }
                return false;
            })
            .sorted((a, b) -> {
                // Sort: PENDING y-jiw l-foq (wallah 7tarem l-weqt li dejà m-calculé)
                if (a.getStartTime() == null || b.getStartTime() == null) return 0;
                return a.getStartTime().compareTo(b.getStartTime());
            })
            .toList();

        System.out.println("Found Appointments: " + filteredApps.size());
        return filteredApps.stream().map(this::mapToResponseDTO).toList();
    }
}
