package com.samjones329.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.samjones329.model.Server;

@Repository
public interface ServerRepo extends JpaRepository<Server, Long> {
    List<Server> findByNameContaining(String name);
}
