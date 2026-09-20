package com.capstone.ragclinical.service;

import com.capstone.ragclinical.dto.QuestionDtos.AskResponse;
import com.capstone.ragclinical.dto.QuestionDtos.SourceDto;
import com.capstone.ragclinical.model.Question;
import com.capstone.ragclinical.repository.QuestionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final AiServiceClient aiServiceClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public QuestionService(QuestionRepository questionRepository, AiServiceClient aiServiceClient) {
        this.questionRepository = questionRepository;
        this.aiServiceClient = aiServiceClient;
    }

    @SuppressWarnings("unchecked")
    public AskResponse ask(Long userId, String questionText, String category) {
        Map result = aiServiceClient.ask(questionText, category);

        Question question = new Question();
        question.setUserId(userId);
        question.setQuestionText(questionText);
        question.setAnswerText((String) result.get("answer"));
        question.setConfidence(((Number) result.get("confidence")).doubleValue());
        try {
            question.setSourcesJson(objectMapper.writeValueAsString(result.get("sources")));
        } catch (Exception e) {
            question.setSourcesJson("[]");
        }
        question = questionRepository.save(question);

        AskResponse response = new AskResponse();
        response.questionId = question.getId();
        response.answer = question.getAnswerText();
        response.confidence = question.getConfidence();
        response.suggestedFollowups = (List<String>) result.get("suggested_followups");

        List<Map<String, Object>> rawSources = (List<Map<String, Object>>) result.get("sources");
        response.sources = rawSources.stream().map(s -> {
            SourceDto dto = new SourceDto();
            dto.documentId = (String) s.get("document_id");
            dto.filename = (String) s.get("filename");
            dto.page = ((Number) s.get("page")).intValue();
            dto.chapter = (String) s.get("chapter");
            dto.snippet = (String) s.get("snippet");
            return dto;
        }).toList();

        return response;
    }

    public List<Question> history(Long userId) {
        return questionRepository.findByUserIdOrderByAskedAtDesc(userId);
    }

    public List<Question> recent(Long userId) {
        return questionRepository.findTop10ByUserIdOrderByAskedAtDesc(userId);
    }

    public List<Question> searchHistory(Long userId, String keyword) {
        return questionRepository.findByUserIdAndQuestionTextContainingIgnoreCaseOrderByAskedAtDesc(
                userId, keyword);
    }

    public long countForUser(Long userId) {
        return questionRepository.countByUserId(userId);
    }
}
