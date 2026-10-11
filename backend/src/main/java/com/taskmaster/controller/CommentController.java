package com.taskmaster.controller;

import com.taskmaster.model.Comment;
import com.taskmaster.model.Task;
import com.taskmaster.repository.CommentRepository;
import com.taskmaster.repository.TaskRepository;
import com.taskmaster.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    public CommentController(CommentRepository commentRepository, TaskRepository taskRepository, NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<Comment> getComments(@RequestParam Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
    }

    @PostMapping
    public Comment addComment(@RequestBody Comment comment) {
        Comment saved = commentRepository.save(comment);
        Long projectId = null;
        if (comment.getTaskId() != null) {
            projectId = taskRepository.findById(comment.getTaskId())
                    .map(Task::getProjectId)
                    .orElse(null);
        }
        notificationService.broadcast("COMMENT_ADDED", "COMMENT", saved.getId(), projectId, saved,
                comment.getAuthorName() + " added a comment");
        return saved;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentRepository.findById(id).ifPresent(comment -> {
            Long projectId = taskRepository.findById(comment.getTaskId())
                    .map(Task::getProjectId)
                    .orElse(null);
            commentRepository.deleteById(id);
            notificationService.broadcast("COMMENT_DELETED", "COMMENT", id, projectId, null, "Comment deleted");
        });
        return ResponseEntity.noContent().build();
    }
}
