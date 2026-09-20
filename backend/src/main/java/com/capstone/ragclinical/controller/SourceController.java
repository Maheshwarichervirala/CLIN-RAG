package com.capstone.ragclinical.controller;

import com.capstone.ragclinical.model.Document;
import com.capstone.ragclinical.service.DocumentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Read-only document browsing for any authenticated user (clinicians
 * should be able to see what's in the knowledge base). Upload, delete,
 * and re-index remain admin-only in DocumentController under
 * /api/admin/documents — this endpoint never mutates anything. */
@RestController
@RequestMapping("/api/documents")
public class SourceController {

    private final DocumentService documentService;

    public SourceController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public List<Document> list() {
        return documentService.list();
    }
}
