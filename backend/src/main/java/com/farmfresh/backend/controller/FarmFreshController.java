
package com.farmfresh.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:3000",
    "https://remarkable-illumination-production-cbcf.up.railway.app"
})
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
