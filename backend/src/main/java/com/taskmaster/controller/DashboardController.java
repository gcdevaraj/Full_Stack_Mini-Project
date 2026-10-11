package com.taskmaster.controller;

import com.taskmaster.dto.DashboardStatsDto;
import com.taskmaster.model.Project;
import com.taskmaster.model.Task;
import com.taskmaster.repository.ProjectRepository;
import com.taskmaster.repository.TaskRepository;
import com.taskmaster.repository.TeamMemberRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final TeamMemberRepository teamMemberRepository;

    public DashboardController(ProjectRepository projectRepository, TaskRepository taskRepository, TeamMemberRepository teamMemberRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.teamMemberRepository = teamMemberRepository;
    }

    @GetMapping("/stats")
    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        List<Project> projects = projectRepository.findAll();
        List<Task> tasks = taskRepository.findAll();
        long memberCount = teamMemberRepository.count();

        stats.setTotalProjects(projects.size());
        stats.setActiveProjects(projects.stream().filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus())).count());
        stats.setCompletedProjects(projects.stream().filter(p -> "COMPLETED".equalsIgnoreCase(p.getStatus())).count());

        stats.setTotalTasks(tasks.size());
        stats.setTodoTasks(tasks.stream().filter(t -> "TODO".equalsIgnoreCase(t.getStatus())).count());
        stats.setInProgressTasks(tasks.stream().filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus())).count());
        stats.setReviewTasks(tasks.stream().filter(t -> "REVIEW".equalsIgnoreCase(t.getStatus())).count());
        stats.setDoneTasks(tasks.stream().filter(t -> "DONE".equalsIgnoreCase(t.getStatus())).count());

        stats.setTotalTeamMembers(memberCount);

        if (tasks.isEmpty()) {
            stats.setOverallCompletionRate(0.0);
        } else {
            double rate = ((double) stats.getDoneTasks() / tasks.size()) * 100.0;
            stats.setOverallCompletionRate(Math.round(rate * 10.0) / 10.0);
        }

        Map<String, Long> statusMap = new HashMap<>();
        statusMap.put("TODO", stats.getTodoTasks());
        statusMap.put("IN_PROGRESS", stats.getInProgressTasks());
        statusMap.put("REVIEW", stats.getReviewTasks());
        statusMap.put("DONE", stats.getDoneTasks());
        stats.setTasksByStatus(statusMap);

        Map<String, Long> priorityMap = new HashMap<>();
        priorityMap.put("LOW", tasks.stream().filter(t -> "LOW".equalsIgnoreCase(t.getPriority())).count());
        priorityMap.put("MEDIUM", tasks.stream().filter(t -> "MEDIUM".equalsIgnoreCase(t.getPriority())).count());
        priorityMap.put("HIGH", tasks.stream().filter(t -> "HIGH".equalsIgnoreCase(t.getPriority())).count());
        priorityMap.put("URGENT", tasks.stream().filter(t -> "URGENT".equalsIgnoreCase(t.getPriority())).count());
        stats.setTasksByPriority(priorityMap);

        return stats;
    }
}
