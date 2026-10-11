package com.taskmaster.dto;

import java.time.LocalDateTime;

public class WebSocketMessage {

    private String type; // e.g. "TASK_CREATED", "TASK_UPDATED", "TASK_STATUS_CHANGED", "TASK_DELETED", "COMMENT_ADDED", "ATTACHMENT_ADDED"
    private String entity; // "TASK", "PROJECT", "COMMENT", "ATTACHMENT", "TEAM"
    private Long entityId;
    private Long projectId;
    private Object payload;
    private String message;
    private LocalDateTime timestamp = LocalDateTime.now();

    public WebSocketMessage() {}

    public WebSocketMessage(String type, String entity, Long entityId, Long projectId, Object payload, String message) {
        this.type = type;
        this.entity = entity;
        this.entityId = entityId;
        this.projectId = projectId;
        this.payload = payload;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getEntity() {
        return entity;
    }

    public void setEntity(String entity) {
        this.entity = entity;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Object getPayload() {
        return payload;
    }

    public void setPayload(Object payload) {
        this.payload = payload;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
