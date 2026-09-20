package com.capstone.ragclinical.repository;

import com.capstone.ragclinical.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    long countByHelpfulTrue();
    long countByHelpfulFalse();
}
