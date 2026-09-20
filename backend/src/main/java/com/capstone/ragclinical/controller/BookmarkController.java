package com.capstone.ragclinical.controller;

import com.capstone.ragclinical.model.Bookmark;
import com.capstone.ragclinical.model.User;
import com.capstone.ragclinical.repository.BookmarkRepository;
import com.capstone.ragclinical.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Bookmark answers — mini-feature #4. */
@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarkRepository bookmarkRepository;
    private final UserService userService;

    public BookmarkController(BookmarkRepository bookmarkRepository, UserService userService) {
        this.bookmarkRepository = bookmarkRepository;
        this.userService = userService;
    }

    private Long currentUserId(Authentication auth) {
        User user = userService.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));
        return user.getId();
    }

    @PostMapping("/{questionId}")
    public Bookmark add(@PathVariable Long questionId, Authentication auth) {
        Bookmark bookmark = new Bookmark();
        bookmark.setUserId(currentUserId(auth));
        bookmark.setQuestionId(questionId);
        return bookmarkRepository.save(bookmark);
    }

    @DeleteMapping("/{id}")
    public void remove(@PathVariable Long id) {
        bookmarkRepository.deleteById(id);
    }

    @GetMapping
    public List<Bookmark> list(Authentication auth) {
        return bookmarkRepository.findByUserId(currentUserId(auth));
    }
}
