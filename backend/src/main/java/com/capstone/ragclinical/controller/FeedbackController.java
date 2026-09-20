package com.capstone.ragclinical.controller;

import com.capstone.ragclinical.dto.QuestionDtos.FeedbackRequest;
import com.capstone.ragclinical.model.Feedback;
import com.capstone.ragclinical.model.User;
import com.capstone.ragclinical.repository.FeedbackRepository;
import com.capstone.ragclinical.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/** 👍 / 👎 feedback on answers — mini-feature #9. */
@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final UserService userService;

    public FeedbackController(FeedbackRepository feedbackRepository, UserService userService) {
        this.feedbackRepository = feedbackRepository;
        this.userService = userService;
    }

    @PostMapping
    public Feedback submit(@RequestBody FeedbackRequest req, Authentication auth) {
        User user = userService.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Feedback feedback = new Feedback();
        feedback.setUserId(user.getId());
        feedback.setQuestionId(req.questionId);
        feedback.setHelpful(req.helpful);
        return feedbackRepository.save(feedback);
    }
}
