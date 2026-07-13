package com.trackage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCategoryRequest {
    @NotNull
    private Long groupId;
    @NotBlank
    private String name;
    private String color;
    private String icon;

}