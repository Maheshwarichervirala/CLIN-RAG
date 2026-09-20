package com.capstone.ragclinical.controller;

import com.capstone.ragclinical.model.Document;
import com.capstone.ragclinical.model.User;
import com.capstone.ragclinical.repository.*;
import com.capstone.ragclinical.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/** User dashboard (mini-feature #12) and admin statistics (mini-feature
 * #20). Kept intentionally simple — counts and a couple of groupings,
 * no separate analytics pipeline. */
@RestController
public class DashboardController {

    private final DocumentRepository documentRepository;
    private final QuestionRepository questionRepository;
    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public DashboardController(DocumentRepository documentRepository,
                                QuestionRepository questionRepository,
                                BookmarkRepository bookmarkRepository,
                                UserRepository userRepository,
                                UserService userService) {
        this.documentRepository = documentRepository;
        this.questionRepository = questionRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping("/api/dashboard")
    public Map<String, Object> userDashboard(Authentication auth) {
        User user = userService.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Optional<Document> mostRecentUpload = documentRepository.findAll().stream()
                .max(Comparator.comparing(Document::getUploadedAt));

        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("totalDocuments", documentRepository.count());
        dashboard.put("questionsAsked", questionRepository.countByUserId(user.getId()));
        dashboard.put("savedAnswers", bookmarkRepository.countByUserId(user.getId()));
        dashboard.put("recentUpload", mostRecentUpload.map(Document::getFilename).orElse(null));
        dashboard.put("lastLogin", user.getLastLogin());
        dashboard.put("name", user.getName());
        dashboard.put("email", user.getEmail());
        return dashboard;
    }

    @GetMapping("/api/admin/stats")
    public Map<String, Object> adminStats() {
        List<Document> documents = documentRepository.findAll();

        Map<String, Long> byCategory = documents.stream()
                .collect(Collectors.groupingBy(Document::getCategory, Collectors.counting()));
        String topCategory = byCategory.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey).orElse("N/A");

        LocalDateTime startOfToday = LocalDateTime.now().toLocalDate().atStartOfDay();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalDocuments", documents.size());
        stats.put("questionsToday", questionRepository.countByAskedAtAfter(startOfToday));
        stats.put("topCategory", topCategory);
        stats.put("documentsByCategory", byCategory);
        return stats;
    }
}
