package com.example.barcut;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import java.awt.*;
import java.net.URI;
import java.time.LocalDate;

@SpringBootApplication
public class BarCutApplication implements CommandLineRunner {

    public static void main(String[] args) {
        System.setProperty("java.awt.headless", "false");
        SpringApplication.run(BarCutApplication.class, args);
    }

//    @EventListener(ApplicationReadyEvent.class)
//    public void openBrowser() {
//        try {
//            String url = "http://localhost:49080";
//            if (Desktop.isDesktopSupported()) {
//                Desktop.getDesktop().browse(new URI(url));
//            } else {
//                Runtime.getRuntime().exec("rundll32 url.dll,FileProtocolHandler " + url);
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//    }

    @Override
    public void run(String... args) throws Exception {
        LocalDate currentDate = LocalDate.now();
        if (currentDate.isAfter(LocalDate.of(2026, 2, 1))) {
            System.out.println("The application has expired and will now exit.");
            System.exit(0);
        }
    }
}
