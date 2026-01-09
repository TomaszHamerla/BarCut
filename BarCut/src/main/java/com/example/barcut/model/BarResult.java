package com.example.barcut.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class BarResult {
    private int totalLength;
    private List<Integer> cuts;
    private int waste;
    private int stockReturn;
}