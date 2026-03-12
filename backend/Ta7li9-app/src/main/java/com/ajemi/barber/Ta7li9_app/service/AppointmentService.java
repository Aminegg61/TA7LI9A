package com.ajemi.barber.Ta7li9_app.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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

@Service
public class AppointmentService {
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ServiceRepository serviceRepository;

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
    public AppointmentResponseDTO createManualAppointment(Long coiffeurId, AppointmentRequestDTO dto) {
        AppointmentEntity appointment = new AppointmentEntity();
        // 1. Jib l-Coiffeur
        User coiffeur = userRepository.findById(coiffeurId)
                .orElseThrow(() -> new RuntimeException("Coiffeur not found"));
        appointment.setCoiffeur(coiffeur);

        // 2. Jib les Services w jme3 l-waqt (Total Duration)
        List<Long> serviceIds = dto.getServiceIds();
        List<ServiceEntity> selectedServices = serviceRepository.findAllById(serviceIds);
        int totalDuration = selectedServices.stream()
                .mapToInt(ServiceEntity::getDuration)
                .sum();
        appointment.setServices(selectedServices);


        // 3. Logic d n-nouba (The Heart of the Queue)
        // Jib l-akhir wahed m-stti 3nd had l-coiffeur (Ordered by endTime DESC)

        Optional<AppointmentEntity> lastApp = appointmentRepository.findTopByCoiffeurIdOrderByEndTimeDesc(coiffeurId);
        LocalDateTime startTime;
        LocalDateTime now = java.time.LocalDateTime.now();

        if (lastApp.isPresent() && lastApp.get().getEndTime().isAfter(now)) {
        startTime = lastApp.get().getEndTime(); // Bda m3a l-weqt fin kiy-salli s-sayed li qblu
        } else {
            startTime = now; // Ila l-ma7al khawi wala l-queue t-salat, bda dba nishan
        }
        appointment.setStartTime(startTime);
        appointment.setEndTime(startTime.plusMinutes(totalDuration));
        appointment.setStatus(com.ajemi.barber.Ta7li9_app.entity.AppointmentStatus.WAITING);

        // 4. Client Logic (Registered vs Guest)
            if (dto.getClientId() != null) {
            User client = userRepository.findById(dto.getClientId()).orElseThrow(() -> new RuntimeException("Client not found"));
            appointment.setClient(client);
            appointment.setManualClientName(null);
        } else {
            appointment.setClient(null);
            appointment.setManualClientName(dto.getManualName()); // Smiya li dkhlti manual f Angular
        }

        AppointmentEntity savedApp = appointmentRepository.save(appointment);
        return mapToResponseDTO(savedApp);

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
        // 1. 7seb s-sba7 w l-lil d lyoma nishan
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay(); // 00:00:00
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX); // 23:59:59

        // 2. Statuses li bghina n-choufou f l-queue
        List<AppointmentStatus> activeStatuses = List.of(
            AppointmentStatus.WAITING, 
            AppointmentStatus.IN_PROGRESS
        );

        // 3. Jib l-lista mn l-Base de données
        List<AppointmentEntity> todayApps = appointmentRepository
            .findByCoiffeurIdAndStatusInAndStartTimeBetweenOrderByStartTimeAsc(
                coiffeurId, 
                activeStatuses, 
                startOfDay, 
                endOfDay
            );

        return todayApps.stream().map(this::mapToResponseDTO).toList();
    }
}
