package com.trackage.service;

import com.trackage.dto.CategoryDTO;
import com.trackage.entity.AppGroup;
import com.trackage.entity.Category;
import com.trackage.exception.ResourceNotFoundException;
import com.trackage.repository.AppGroupRepository;
import com.trackage.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final AppGroupRepository appGroupRepository;

    public List<CategoryDTO> getCategories(Long groupId) {
        return categoryRepository.findByGroup_IdOrderByNameAsc(groupId).stream()
                .map(c -> CategoryDTO.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .color(c.getColor())
                        .icon(c.getIcon())
                        .build())
                .toList();
    }

    public Category createCategory(Long groupId, String name, String color, String icon) {
        AppGroup group = appGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        Category cat = Category.builder().group(group).name(name).color(color).icon(icon).build();
        return categoryRepository.save(cat);
    }

    public CategoryDTO createCategoryDTO(Long groupId, String name, String color, String icon) {
        Category cat = createCategory(groupId, name, color, icon);
        return CategoryDTO.builder().id(cat.getId()).name(cat.getName()).color(cat.getColor())
                .icon(cat.getIcon()).build();
    }
}
