package com.ajemi.barber.Ta7li9_app.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ajemi.barber.Ta7li9_app.entity.AppointmentEntity;
import com.ajemi.barber.Ta7li9_app.entity.AppointmentStatus;
import com.ajemi.barber.Ta7li9_app.entity.User;

public interface AppointmentRepository extends JpaRepository<AppointmentEntity, Long> {
    //serach clients nta3 coiffeur li tabda smiythom(last,firstName)%LIKE% 
    @Query("SELECT DISTINCT a.client FROM AppointmentEntity a " +
       "WHERE a.coiffeur.id = :coiffeurId " +
       "AND a.client IS NOT NULL " +
       "AND (LOWER(a.client.firstName) LIKE LOWER(CONCAT(:query, '%')) " +
       "OR LOWER(a.client.lastName) LIKE LOWER(CONCAT(:query, '%')))")
    List<User> findMyPastClients(@Param("coiffeurId") Long coiffeurId, @Param("query") String query);

    // 2. Jib l-akhir Appointment dyal l-yom bach n-7sbo startTime jdid
    // (Sort b ID desc wala endTime desc bach n-akhdo l-akhir wahed)
    Optional<AppointmentEntity> findTopByCoiffeurIdOrderByEndTimeDesc(Long coiffeurId);


    // 3. Jib GA3 WAITINGClient or in p-rogress d l-yom (ga3 li WAITING wala IN_PROGRESS)
    List<AppointmentEntity> findByCoiffeurIdAndStatusInOrderByStartTimeAsc(
            Long coiffeurId, 
            List<AppointmentStatus> status
    );
    // 1. Had l-méthode hiya li ghadi t-khdem biha f l-Update dyal l-waqt (The Ripple Effect)
    // Kat-jbed ghir n-nas li WAITING w li n-nouba dyalhom bāqa ma-bdatsh
    List<AppointmentEntity> findByCoiffeurIdAndStatusAndStartTimeAfterOrderByStartTimeAsc(
        Long coiffeurId, 
        AppointmentStatus status, 
        java.time.LocalDateTime time
    );

    List<AppointmentEntity> findByCoiffeurIdAndStatusInAndStartTimeBetweenOrderByStartTimeAsc(
        Long coiffeurId, 
        List<AppointmentStatus> statuses, 
        java.time.LocalDateTime start, 
        java.time.LocalDateTime end
    );
    
    boolean existsByClientIdAndStatusIn(Long clientId, List<AppointmentStatus> statuses);
    List<AppointmentEntity> findByCoiffeurIdAndStatusIn(Long coiffeurId, List<AppointmentStatus> statuses);
    Optional<AppointmentEntity> findTopByCoiffeurIdAndStatusInOrderByEndTimeDesc(
        Long coiffeurId, 
        List<AppointmentStatus> statuses
    );
    // List<AppointmentEntity> findByCoiffeurIdAndStatusInAndCreatedAtBeforeOrderByCreatedAtAsc(
    //     Long barberId, 
    //     List<AppointmentStatus> statuses, 
    //     LocalDateTime createdAt
    // );

}
