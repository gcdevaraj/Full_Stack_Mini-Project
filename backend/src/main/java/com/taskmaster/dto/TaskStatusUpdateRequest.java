package com.taskmaster.dto;

public class TaskStatusUpdateRequest {
    private String status;
    private Integer orderIndex;

    public TaskStatusUpdateRequest() {}

    public TaskStatusUpdateRequest(String status, Integer orderIndex) {
        this.status = status;
        this.orderIndex = orderIndex;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
}
