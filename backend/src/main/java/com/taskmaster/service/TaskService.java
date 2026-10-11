package com.taskmaster.service;

import com.taskmaster.dto.TaskStatusUpdateRequest;
import com.taskmaster.model.Task;
import com.taskmaster.repository.AttachmentRepository;
import com.taskmaster.repository.CommentRepository;
import com.taskmaster.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final AttachmentRepository attachmentRepository;
    private final NotificationService notificationService;

    public TaskService(TaskRepository taskRepository,
                       CommentRepository commentRepository,
                       AttachmentRepository attachmentRepository,
                       NotificationService notificationService) {
        this.taskRepository = taskRepository;
        this.commentRepository = commentRepository;
        this.attachmentRepository = attachmentRepository;
        this.notificationService = notificationService;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<Task> getTasksByProjectId(Long projectId) {
        return taskRepository.findByProjectIdOrderByOrderIndexAsc(projectId);
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    @Transactional
    public Task createTask(Task task) {
        if (task.getStatus() == null || task.getStatus().isBlank()) {
            task.setStatus("TODO");
        }
        if (task.getPriority() == null || task.getPriority().isBlank()) {
            task.setPriority("MEDIUM");
        }
        Task saved = taskRepository.save(task);
        notificationService.broadcast("TASK_CREATED", "TASK", saved.getId(), saved.getProjectId(), saved, "Task created: " + saved.getTitle());
        return saved;
    }

    @Transactional
    public Task updateTask(Long id, Task details) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id " + id));

        task.setTitle(details.getTitle());
        task.setDescription(details.getDescription());
        task.setStatus(details.getStatus());
        task.setPriority(details.getPriority());
        task.setAssigneeId(details.getAssigneeId());
        task.setAssigneeName(details.getAssigneeName());
        task.setAssigneeAvatar(details.getAssigneeAvatar());
        task.setDueDate(details.getDueDate());
        task.setEstimatedHours(details.getEstimatedHours());
        task.setLoggedHours(details.getLoggedHours());
        task.setTags(details.getTags());
        if (details.getOrderIndex() != null) {
            task.setOrderIndex(details.getOrderIndex());
        }

        Task updated = taskRepository.save(task);
        notificationService.broadcast("TASK_UPDATED", "TASK", updated.getId(), updated.getProjectId(), updated, "Task updated: " + updated.getTitle());
        return updated;
    }

    @Transactional
    public Task updateTaskStatus(Long id, TaskStatusUpdateRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id " + id));

        String oldStatus = task.getStatus();
        task.setStatus(request.getStatus());
        if (request.getOrderIndex() != null) {
            task.setOrderIndex(request.getOrderIndex());
        }

        Task updated = taskRepository.save(task);
        notificationService.broadcast("TASK_STATUS_CHANGED", "TASK", updated.getId(), updated.getProjectId(), updated,
                "Task '" + task.getTitle() + "' moved from " + oldStatus + " to " + request.getStatus());
        return updated;
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id).orElse(null);
        if (task != null) {
            Long projectId = task.getProjectId();
            // Delete associated comments and attachments
            commentRepository.deleteAll(commentRepository.findByTaskIdOrderByCreatedAtDesc(id));
            attachmentRepository.deleteAll(attachmentRepository.findByTaskIdOrderByUploadedAtDesc(id));
            taskRepository.deleteById(id);
            notificationService.broadcast("TASK_DELETED", "TASK", id, projectId, null, "Task deleted: " + task.getTitle());
        }
    }
}
