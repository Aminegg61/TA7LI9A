package com.ajemi.barber.Ta7li9_app.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ajemi.barber.Ta7li9_app.dto.BarberSearchDto;
import com.ajemi.barber.Ta7li9_app.entity.AppointmentEntity;
import com.ajemi.barber.Ta7li9_app.entity.AppointmentStatus;
import com.ajemi.barber.Ta7li9_app.entity.FollowedBarber;
import com.ajemi.barber.Ta7li9_app.entity.ServiceEntity;
import com.ajemi.barber.Ta7li9_app.entity.User;
import com.ajemi.barber.Ta7li9_app.repository.AppointmentRepository;
import com.ajemi.barber.Ta7li9_app.repository.FollowedRepository;
import com.ajemi.barber.Ta7li9_app.repository.UserRepository;

@Service
public class ManageBarberService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FollowedRepository followedRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;

    public List<BarberSearchDto> findBarberForClient(String query, Long clientId) {
        // 1. Jib l-barbers mn l-ba7t
        List<User> barbers = userRepository.searchBarbers(query);

        // 2. Mapper m3a l-check d l-favorite
        return barbers.stream()
                .map(barber -> {
                    // N-choufou wach had l-barber m-ajouté 3nd had l-client
                    boolean isFav = false;
                    if (clientId != null) {
                        isFav = followedRepository.existsByClientAndBarber(
                            userRepository.getReferenceById(clientId), barber);
                    }
                    return convertToDto(barber, isFav,clientId);
                })
                .collect(Collectors.toList());
    }

    private BarberSearchDto convertToDto(User user, boolean isFav,Long id) {
        BarberSearchDto dto = new BarberSearchDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setCurrentStatus(user.getCurrentStatus()); // Hadchi kheddam b WebSocket
        dto.setFavorite(isFav);
            // 🕒 estimated wait time
        int waitTime = calculateEstimatedWaitTime(user.getId());
        dto.setEstimatedWaitTime(waitTime);
                    boolean alreadyInQueue = appointmentRepository.existsByClientIdAndStatusIn(
                id, 
                List.of(AppointmentStatus.PENDING, AppointmentStatus.WAITING, AppointmentStatus.IN_PROGRESS)
            );
        dto.setInQueue(alreadyInQueue); // غادي نحسبوها بعداً
        return dto;
    }

    @Transactional
    public void addBarberToMyList(Long clientId, Long barberId) {
        User client = userRepository.findById(clientId).orElseThrow(() -> new RuntimeException("Client not found"));
        User barber = userRepository.findById(barberId).orElseThrow(() -> new RuntimeException("Barber not found"));
        if (!"ROLE_COIFFEUR".equals(barber.getRole())) {
            throw new RuntimeException("Hada machi coiffeur!");
        }
        // Check wach deja m-ad-ih bach ma-i-t-3awedch
        if (!followedRepository.existsByClientAndBarber(client, barber)) {
            FollowedBarber follow = new FollowedBarber();
            follow.setClient(client);
            follow.setBarber(barber);
            followedRepository.save(follow);
        }
    }
        // 1. Jib ghir l-coiffeurs li machi favorites (isFavorite = false)
    public List<BarberSearchDto> getMyBarbers(Long clientId) {
    
        List<FollowedBarber> regulars = followedRepository.findByClientIdAndIsFavorite(clientId,false);

        // 2. Mapper mn FavoriteBarber Entity l BarberSearchDto
        return regulars.stream()
                .map(fav -> convertToDto(fav.getBarber(), false,clientId))
                .collect(Collectors.toList());
    }

    // 2. Jib ghir l-favorites (isFavorite = true)
    public List<BarberSearchDto> getMyFavoriteBarbers(Long clientId) {
        List<FollowedBarber> favorites = followedRepository.findByClientIdAndIsFavorite(clientId, true);
        return favorites.stream()
                .map(fav -> convertToDto(fav.getBarber(), true,clientId))
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeBarberFromMyList(Long clientId, Long barberId) {
        // 1. Check wach had l-favorite déjà kayn
        User client = userRepository.findById(clientId).orElseThrow(() -> new RuntimeException("Client not found"));
        User barber = userRepository.findById(barberId).orElseThrow(() -> new RuntimeException("Barber not found"));

        if (!followedRepository.existsByClientAndBarber(client, barber)) {
            throw new RuntimeException("Had l-coiffeur machi f l-lista dyalk!");
        }

        followedRepository.deleteByClientIdAndBarberId(clientId, barberId);
    }

    @Transactional
    public void toggleFavoriteStatus(Long clientId, Long barberId) {
        FollowedBarber favorite = followedRepository.findByClientIdAndBarberId(clientId, barberId)
                .orElseThrow(() -> new RuntimeException("Had l-coiffeur machi f l-lista dyalk!"));

        // Toggle l-status
        favorite.setFavorite(!favorite.isFavorite());
        followedRepository.save(favorite);
    }

    private int calculateEstimatedWaitTime(Long barberId) {
            // 1️⃣ نجيبو appointments لي IN_PROGRESS و WAITING
            List<AppointmentStatus> statuses = List.of(
                AppointmentStatus.IN_PROGRESS,
                AppointmentStatus.WAITING
            );
                List<AppointmentEntity> queue = appointmentRepository
            .findByCoiffeurIdAndStatusInOrderByStartTimeAsc(barberId, statuses);

                int totalMinutes = 0;
                LocalDateTime now = LocalDateTime.now();
                    // 2️⃣ نحسبو كل appointment
            for (AppointmentEntity appointment : queue) {

                if (appointment.getStatus() == AppointmentStatus.IN_PROGRESS) {
                    // الوقت لي بقا فالكرسي
                    long remaining = Duration.between(now, appointment.getEndTime()).toMinutes();
                    if (remaining > 0) {
                        totalMinutes += remaining;
                    }
                } else { // WAITING
                    // نجمعو مدة كل الخدمات لي اختاروها
                    int duration = appointment.getServices()
                            .stream()
                            .mapToInt(ServiceEntity::getDuration)
                            .sum();
                    totalMinutes += duration;
                }
            }

            return totalMinutes; // بالدقائق
    }

}
