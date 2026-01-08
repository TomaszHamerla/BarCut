package com.example.barcut.controller;

import com.example.barcut.model.BarResult;
import com.example.barcut.model.OptimizationRequest;
import com.example.barcut.service.OptimizerService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class OptimizerController {
    private final OptimizerService service;

    public OptimizerController(OptimizerService service) {
        this.service = service;
    }

    @PostMapping("/optimize")
    public List<BarResult> optimize(@RequestBody OptimizationRequest request) {
        return service.calculateOptimization(request.getCuts(), request.getStockLength());
    }
}