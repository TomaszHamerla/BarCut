package com.example.barcut.model;

import lombok.Data;

import java.util.List;

@Data
public class OptimizationRequest {
    private List<Integer> cuts;
    private int stockLength;
}
