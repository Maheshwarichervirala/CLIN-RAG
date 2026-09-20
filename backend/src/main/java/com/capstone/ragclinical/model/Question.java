package com.capstone.ragclinical.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "questions")
public class Question {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(length = 2000, nullable = false)
    private String questionText;

    @Column(length = 4000)
    private String answerText;

    private Double confidence;

    @Column(length = 4000)
    private String sourcesJson;

    private LocalDateTime askedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public String getAnswerText() { return answerText; }
    public void setAnswerText(String answerText) { this.answerText = answerText; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    public String getSourcesJson() { return sourcesJson; }
    public void setSourcesJson(String sourcesJson) { this.sourcesJson = sourcesJson; }
    public LocalDateTime getAskedAt() { return askedAt; }
}
