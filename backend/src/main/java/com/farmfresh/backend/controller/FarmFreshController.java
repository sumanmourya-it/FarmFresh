package com.farmfresh.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FarmFreshController {

    @GetMapping("/")
    public String home() {
        return "Welcome to FarmFresh Backend!";
    }

    @GetMapping("/api/hello")
    public String hello() {
        return "FarmFresh API is working successfully!";
    }
}