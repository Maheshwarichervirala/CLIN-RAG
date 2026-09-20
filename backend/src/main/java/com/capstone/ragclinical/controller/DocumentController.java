package com.capstone.ragclinical.controller;

import com.capstone.ragclinical.model.Document;
import com.capstone.ragclinical.service.DocumentService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/** Admin-only document management: upload, list, delete, re-index,
 * search — matches the "Admin" module list (upload PDFs, delete
 * documents, view uploaded documents, re-index knowledge base). */
@RestController
@RequestMapping("/api/admin/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping
    public Document upload(@RequestParam("file") MultipartFile file,
                            @RequestParam("category") String category) throws IOException {
        return documentService.upload(file, category);
    }

    @GetMapping
    public List<Document> list(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return documentService.search(search);
        }
        return documentService.list();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        documentService.delete(id);
    }

    @PostMapping("/reindex")
    public Map reindex() {
        return documentService.reindex();
    }
}
