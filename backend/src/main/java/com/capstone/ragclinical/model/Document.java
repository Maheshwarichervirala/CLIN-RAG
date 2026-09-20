package com.capstone.ragclinical.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {
    @Id
    private String id;

    @Column(nullable = false)
    private String filename;

    private String category;
    private int chunkCount;
    private LocalDateTime uploadedAt = LocalDateTime.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public int getChunkCount() { return chunkCount; }
    public void setChunkCount(int chunkCount) { this.chunkCount = chunkCount; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
}
