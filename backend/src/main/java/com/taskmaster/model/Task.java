package com.taskmaster.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Status: TODO, IN_PROGRESS, REVIEW, DONE
    @Column(nullable = false)
    private String status = "TODO";

    // Priority: LOW, MEDIUM, HIGH, URGENT
    @Column(nullable = false)
    private String priority = "MEDIUM";

    @Column(nullable = false)
    private Long projectId;

    private Long assigneeId;

    private String assigneeName;

    private String assigneeAvatar;

    private LocalDate dueDate;

    private Integer estimatedHours = 0;

    private Integer loggedHours = 0;

    private String tags; // Comma separated tags e.g. "Backend,API,Bug"

    private Integer orderIndex = 0;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public Task() {}

    public Task(String title, String description, String status, String priority, Long projectId,
                Long assigneeId, String assigneeName, String assigneeAvatar, LocalDate dueDate,
                Integer estimatedHours, String tags, Integer orderIndex) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.projectId = projectId;
        this.assigneeId = assigneeId;
        this.assigneeName = assigneeName;
        this.assigneeAvatar = assigneeAvatar;
        this.dueDate = dueDate;
        this.estimatedHours = estimatedHours;
        this.tags = tags;
        this.orderIndex = orderIndex;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }

    public String getAssigneeName() {
        return assigneeName;
    }

    public void setAssigneeName(String assigneeName) {
        this.assigneeName = assigneeName;
    }

    public String getAssigneeAvatar() {
        return assigneeAvatar;
    }

    public void setAssigneeAvatar(String assigneeAvatar) {
        this.assigneeAvatar = assigneeAvatar;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Integer getEstimatedHours() {
        return estimatedHours;
    }

    public void setEstimatedHours(Integer estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public Integer getLoggedHours() {
        return loggedHours;
    }

    public void setLoggedHours(Integer loggedHours) {
        this.loggedHours = loggedHours;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
