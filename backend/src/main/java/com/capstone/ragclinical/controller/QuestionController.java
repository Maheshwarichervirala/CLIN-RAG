package com.capstone.ragclinical.controller;

import com.capstone.ragclinical.dto.QuestionDtos.AskRequest;
import com.capstone.ragclinical.dto.QuestionDtos.AskResponse;
import com.capstone.ragclinical.model.Question;
import com.capstone.ragclinical.model.User;
import com.capstone.ragclinical.service.QuestionService;
import com.capstone.ragclinical.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** User-facing question flow: ask, history, search history, recent
 * (used for the dashboard's "recent searches"). */
@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;
    private final UserService userService;

    public QuestionController(QuestionService questionService, UserService userService) {
        this.questionService = questionService;
        this.userService = userService;
    }

    private Long currentUserId(Authentication auth) {
        User user = userService.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));
        return user.getId();
    }

    @PostMapping("/ask")
    public AskResponse ask(@RequestBody AskRequest req, Authentication auth) {
        return questionService.ask(currentUserId(auth), req.question, req.category);
    }

    @GetMapping("/history")
    public List<Question> history(Authentication auth) {
        return questionService.history(currentUserId(auth));
    }

    @GetMapping("/history/search")
    public List<Question> searchHistory(@RequestParam String keyword, Authentication auth) {
        return questionService.searchHistory(currentUserId(auth), keyword);
    }

    @GetMapping("/recent")
    public List<Question> recent(Authentication auth) {
        return questionService.recent(currentUserId(auth));
    }
}
