package com.capstone.ragclinical.repository;

import com.capstone.ragclinical.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByUserIdOrderByAskedAtDesc(Long userId);
    List<Question> findTop10ByUserIdOrderByAskedAtDesc(Long userId);
    List<Question> findByUserIdAndQuestionTextContainingIgnoreCaseOrderByAskedAtDesc(
        Long userId, String keyword);
    long countByUserId(Long userId);

    // for admin "questions today" stat
    long countByAskedAtAfter(java.time.LocalDateTime after);
}
