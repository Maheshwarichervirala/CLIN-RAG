package com.capstone.ragclinical.repository;

import com.capstone.ragclinical.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, String> {
    List<Document> findByFilenameContainingIgnoreCase(String filename);
    List<Document> findByCategory(String category);
}
