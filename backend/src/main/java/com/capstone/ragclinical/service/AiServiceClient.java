package com.capstone.ragclinical.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/** Thin wrapper around the Python FastAPI AI service. Spring Boot never
 * touches ChromaDB or the LLM directly — it always goes through here. */
@Service
public class AiServiceClient {

    private final RestTemplate restTemplate;

    @Value("${ai.service.base-url}")
    private String baseUrl;

    public AiServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map upload(MultipartFile file, String category) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() { return file.getOriginalFilename(); }
        });
        body.add("category", category);

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
        return restTemplate.postForObject(baseUrl + "/upload", request, Map.class);
    }

    public void delete(String documentId) {
        restTemplate.exchange(baseUrl + "/documents/" + documentId, HttpMethod.DELETE,
                null, Void.class);
    }

    public Map reindex() {
        return restTemplate.postForObject(baseUrl + "/reindex", null, Map.class);
    }

    public Map ask(String question, String category) {
        Map<String, String> body = Map.of("question", question,
                "category", category == null ? "" : category);
        return restTemplate.postForObject(baseUrl + "/ask", body, Map.class);
    }
}
