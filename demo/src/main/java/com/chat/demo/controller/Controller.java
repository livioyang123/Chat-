package com.chat.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class Controller {

    @GetMapping("/ciao")
    public String home() {
        return "Applicazixxasx!";
    }

    @PostMapping("/ciao")
    public String home1() {
        return "ciaoasccassca!";
    }

    @GetMapping("/")
    public String home2() {
        return "ciao2!";
    }

}