package com.taskmaster.repository;

import com.taskmaster.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByProjectIdOrderByOrderIndexAsc(Long projectId);
    List<Task> findByAssigneeId(Long assigneeId);
    List<Task> findByStatus(String status);
}
