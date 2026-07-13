package com.trackage.controller;

import com.trackage.dto.CategoryDTO;
import com.trackage.dto.CreateCategoryRequest;
import com.trackage.service.CategoryService;
import com.trackage.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/trackage")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final GroupService groupService;

    @PostMapping("/categories")
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CreateCategoryRequest req,
                                                        @AuthenticationPrincipal Long currentUserId) {
        groupService.assertMember(req.getGroupId(), currentUserId);
        return ResponseEntity.ok(categoryService.createCategoryDTO(req.getGroupId(), req.getName(), req.getColor(), req.getIcon()));
    }
}
