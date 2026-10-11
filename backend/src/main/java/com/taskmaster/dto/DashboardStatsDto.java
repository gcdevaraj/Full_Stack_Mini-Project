package com.taskmaster.dto;

import java.util.Map;

public class DashboardStatsDto {
    private long totalProjects;
    private long activeProjects;
    private long completedProjects;
    private long totalTasks;
    private long todoTasks;
    private long inProgressTasks;
    private long reviewTasks;
    private long doneTasks;
    private long totalTeamMembers;
    private double overallCompletionRate;
    private Map<String, Long> tasksByStatus;
    private Map<String, Long> tasksByPriority;

    public DashboardStatsDto() {}

    public long getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(long totalProjects) {
        this.totalProjects = totalProjects;
    }

    public long getActiveProjects() {
        return activeProjects;
    }

    public void setActiveProjects(long activeProjects) {
        this.activeProjects = activeProjects;
    }

    public long getCompletedProjects() {
        return completedProjects;
    }

    public void setCompletedProjects(long completedProjects) {
        this.completedProjects = completedProjects;
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public long getTodoTasks() {
        return todoTasks;
    }

    public void setTodoTasks(long todoTasks) {
        this.todoTasks = todoTasks;
    }

    public long getInProgressTasks() {
        return inProgressTasks;
    }

    public void setInProgressTasks(long inProgressTasks) {
        this.inProgressTasks = inProgressTasks;
    }

    public long getReviewTasks() {
        return reviewTasks;
    }

    public void setReviewTasks(long reviewTasks) {
        this.reviewTasks = reviewTasks;
    }

    public long getDoneTasks() {
        return doneTasks;
    }

    public void setDoneTasks(long doneTasks) {
        this.doneTasks = doneTasks;
    }

    public long getTotalTeamMembers() {
        return totalTeamMembers;
    }

    public void setTotalTeamMembers(long totalTeamMembers) {
        this.totalTeamMembers = totalTeamMembers;
    }

    public double getOverallCompletionRate() {
        return overallCompletionRate;
    }

    public void setOverallCompletionRate(double overallCompletionRate) {
        this.overallCompletionRate = overallCompletionRate;
    }

    public Map<String, Long> getTasksByStatus() {
        return tasksByStatus;
    }

    public void setTasksByStatus(Map<String, Long> tasksByStatus) {
        this.tasksByStatus = tasksByStatus;
    }

    public Map<String, Long> getTasksByPriority() {
        return tasksByPriority;
    }

    public void setTasksByPriority(Map<String, Long> tasksByPriority) {
        this.tasksByPriority = tasksByPriority;
    }
}
