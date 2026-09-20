package com.capstone.ragclinical.dto;

import java.util.List;

public class QuestionDtos {

    public static class AskRequest {
        public String question;
        public String category; // optional filter
    }

    public static class SourceDto {
        public String documentId;
        public String filename;
        public int page;
        public String chapter;
        public String snippet;
    }

    public static class AskResponse {
        public Long questionId;
        public String answer;
        public double confidence;
        public List<SourceDto> sources;
        public List<String> suggestedFollowups;
    }

    public static class FeedbackRequest {
        public Long questionId;
        public boolean helpful;
    }
}
