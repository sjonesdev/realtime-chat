package com.samjones329.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

import com.samjones329.model.User;

@Repository
public interface UserRepository extends CassandraRepository<User, UUID> {
    Optional<User> findByEmail(String email);
}
