package com.capstone.ragclinical.service;

import com.capstone.ragclinical.model.Document;
import com.capstone.ragclinical.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final AiServiceClient aiServiceClient;

    public DocumentService(DocumentRepository documentRepository, AiServiceClient aiServiceClient) {
        this.documentRepository = documentRepository;
        this.aiServiceClient = aiServiceClient;
    }

    @SuppressWarnings("unchecked")
    public Document upload(MultipartFile file, String category) throws IOException {
        Map result = aiServiceClient.upload(file, category);

        Document doc = new Document();
        doc.setId((String) result.get("document_id"));
        doc.setFilename((String) result.get("filename"));
        doc.setCategory((String) result.get("category"));
        doc.setChunkCount(((Number) result.get("chunks_indexed")).intValue());
        return documentRepository.save(doc);
    }

    public void delete(String documentId) {
        aiServiceClient.delete(documentId);
        documentRepository.deleteById(documentId);
    }

    public List<Document> list() {
        return documentRepository.findAll();
    }

    public List<Document> search(String keyword) {
        return documentRepository.findByFilenameContainingIgnoreCase(keyword);
    }

    public Map reindex() {
        return aiServiceClient.reindex();
    }
}
