package com.ajemi.barber.Ta7li9_app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ajemi.barber.Ta7li9_app.entity.ServiceEntity;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    // Had l-methode ghadi n-7tajoha bach njbdo ghir les services d wahed l-coiffeur khass
    List<ServiceEntity> findByCoiffeurId(Long coiffeurId);
    //Kat-jbed ghir l-services dyal wahed l-coiffeur li mamsso7inch
    List<ServiceEntity> findByCoiffeurIdAndDeletedFalse(Long coiffeurId);
}