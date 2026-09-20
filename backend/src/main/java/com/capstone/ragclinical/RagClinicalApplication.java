package com.capstone.ragclinical;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.client.RestTemplate;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class RagClinicalApplication {
    public static void main(String[] args) {
        SpringApplication.run(RagClinicalApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
