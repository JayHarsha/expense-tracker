package com.trackage.repository;

import com.trackage.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByGroup_IdOrderByNameAsc(Long groupId);
    Optional<Category> findByGroup_IdAndNameIgnoreCase(Long groupId, String name);
}
