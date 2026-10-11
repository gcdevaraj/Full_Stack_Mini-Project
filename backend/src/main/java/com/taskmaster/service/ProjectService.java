package com.taskmaster.service;

import com.taskmaster.model.Project;
import com.taskmaster.model.Task;
import com.taskmaster.repository.ProjectRepository;
import com.taskmaster.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    public ProjectService(ProjectRepository projectRepository, TaskRepository taskRepository, NotificationService notificationService) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.notificationService = notificationService;
    }

    public List<Project> getAllProjects() {
        List<Project> projects = projectRepository.findAll();
        // Update progress dynamically
        for (Project p : projects) {
            updateProjectProgressInMemory(p);
        }
        return projects;
    }

    public Optional<Project> getProjectById(Long id) {
        Optional<Project> projectOpt = projectRepository.findById(id);
        projectOpt.ifPresent(this::updateProjectProgressInMemory);
        return projectOpt;
    }

    private void updateProjectProgressInMemory(Project project) {
        List<Task> tasks = taskRepository.findByProjectId(project.getId());
        if (tasks.isEmpty()) {
            project.setProgress(0);
        } else {
            long doneCount = tasks.stream().filter(t -> "DONE".equalsIgnoreCase(t.getStatus())).count();
            int pct = (int) Math.round(((double) doneCount / tasks.size()) * 100);
            project.setProgress(pct);
        }
    }

    @Transactional
    public Project createProject(Project project) {
        if (project.getCode() == null || project.getCode().isBlank()) {
            project.setCode("PRJ-" + System.currentTimeMillis() % 1000);
        }
        Project saved = projectRepository.save(project);
        notificationService.broadcast("PROJECT_CREATED", "PROJECT", saved.getId(), saved.getId(), saved, "Project created: " + saved.getName());
        return saved;
    }

    @Transactional
    public Project updateProject(Long id, Project details) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id " + id));

        project.setName(details.getName());
        project.setDescription(details.getDescription());
        project.setStatus(details.getStatus());
        project.setPriority(details.getPriority());
        project.setColor(details.getColor());
        project.setTeamId(details.getTeamId());
        project.setTeamName(details.getTeamName());
        project.setStartDate(details.getStartDate());
        project.setEndDate(details.getEndDate());

        Project updated = projectRepository.save(project);
        updateProjectProgressInMemory(updated);
        notificationService.broadcast("PROJECT_UPDATED", "PROJECT", updated.getId(), updated.getId(), updated, "Project updated: " + updated.getName());
        return updated;
    }

    @Transactional
    public void deleteProject(Long id) {
        // Also delete tasks of project
        List<Task> tasks = taskRepository.findByProjectId(id);
        taskRepository.deleteAll(tasks);
        projectRepository.deleteById(id);
        notificationService.broadcast("PROJECT_DELETED", "PROJECT", id, id, null, "Project deleted");
    }
}
