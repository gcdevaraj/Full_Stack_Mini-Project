package com.taskmaster.config;

import com.taskmaster.model.*;
import com.taskmaster.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final AttachmentRepository attachmentRepository;

    public DataInitializer(TeamRepository teamRepository,
                           TeamMemberRepository teamMemberRepository,
                           ProjectRepository projectRepository,
                           TaskRepository taskRepository,
                           CommentRepository commentRepository,
                           AttachmentRepository attachmentRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.commentRepository = commentRepository;
        this.attachmentRepository = attachmentRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (teamRepository.count() > 0) {
            return; // Data already seeded
        }

        // 1. Create Teams and Members
        Team engTeam = new Team("Core Engineering", "Core full-stack web and backend platform team", "#6366f1");
        teamRepository.save(engTeam);

        TeamMember alex = new TeamMember("Alex Morgan", "alex@company.com", "Principal Architect", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80");
        alex.setTeam(engTeam);
        teamMemberRepository.save(alex);

        TeamMember david = new TeamMember("David Kumar", "david@company.com", "Backend Specialist", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80");
        david.setTeam(engTeam);
        teamMemberRepository.save(david);

        TeamMember sarah = new TeamMember("Sarah Chen", "sarah@company.com", "Lead Frontend Developer", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80");
        sarah.setTeam(engTeam);
        teamMemberRepository.save(sarah);

        Team designTeam = new Team("Product & UX", "UI/UX research, wireframing and design systems", "#ec4899");
        teamRepository.save(designTeam);

        TeamMember elena = new TeamMember("Elena Rostova", "elena@company.com", "Lead Product Designer", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80");
        elena.setTeam(designTeam);
        teamMemberRepository.save(elena);

        Team cloudTeam = new Team("DevOps & SRE", "Infrastructure, CI/CD, and Kubernetes management", "#10b981");
        teamRepository.save(cloudTeam);

        TeamMember priya = new TeamMember("Priya Patel", "priya@company.com", "DevOps Engineer", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80");
        priya.setTeam(cloudTeam);
        teamMemberRepository.save(priya);

        // 2. Create Projects
        Project proj1 = new Project(
                "Cloud Migration & Microservices",
                "CLOUD-101",
                "Migrate legacy monolithic architecture to scalable Spring Boot microservices with reactive event streams and real-time observability.",
                "ACTIVE",
                "HIGH",
                "#6366f1",
                engTeam.getId(),
                engTeam.getName(),
                LocalDate.now().minusDays(10),
                LocalDate.now().plusDays(25)
        );
        proj1 = projectRepository.save(proj1);

        Project proj2 = new Project(
                "Mobile App Redesign 2.0",
                "MOB-202",
                "Create a brand new cross-platform mobile user experience with dynamic dark mode, responsive widgets, and biometric auth.",
                "ACTIVE",
                "URGENT",
                "#ec4899",
                designTeam.getId(),
                designTeam.getName(),
                LocalDate.now().minusDays(5),
                LocalDate.now().plusDays(15)
        );
        proj2 = projectRepository.save(proj2);

        Project proj3 = new Project(
                "Real-time Analytics Dashboard",
                "METRIC-303",
                "Build interactive executive dashboards with live chart streaming, anomaly notifications, and exportable reports.",
                "ACTIVE",
                "MEDIUM",
                "#10b981",
                cloudTeam.getId(),
                cloudTeam.getName(),
                LocalDate.now().minusDays(20),
                LocalDate.now().plusDays(10)
        );
        proj3 = projectRepository.save(proj3);

        // 3. Create Tasks for Project 1 (Cloud Migration)
        Task t1 = new Task(
                "Design WebSocket event streaming schema",
                "Establish STOMP endpoints and message protocols for broadcasting real-time task mutations across client browsers.",
                "DONE",
                "HIGH",
                proj1.getId(),
                alex.getId(),
                alex.getName(),
                alex.getAvatarUrl(),
                LocalDate.now().minusDays(2),
                12,
                "Architecture,WebSocket,Backend",
                1
        );
        t1.setLoggedHours(12);
        taskRepository.save(t1);

        Task t2 = new Task(
                "Implement Kanban Board Drag-and-Drop state machine",
                "Support smooth optimistic updates when moving cards between columns with real-time sync across connected clients.",
                "IN_PROGRESS",
                "URGENT",
                proj1.getId(),
                sarah.getId(),
                sarah.getName(),
                sarah.getAvatarUrl(),
                LocalDate.now().plusDays(3),
                16,
                "Frontend,React,UX",
                2
        );
        t2.setLoggedHours(8);
        taskRepository.save(t2);

        Task t3 = new Task(
                "Configure H2 & JPA entities with auditing",
                "Implement relations for Teams, Projects, Tasks, Comments, and File Attachments with relational constraints.",
                "DONE",
                "MEDIUM",
                proj1.getId(),
                david.getId(),
                david.getName(),
                david.getAvatarUrl(),
                LocalDate.now().minusDays(1),
                8,
                "Database,JPA,Spring",
                3
        );
        t3.setLoggedHours(8);
        taskRepository.save(t3);

        Task t4 = new Task(
                "File Attachment Service & Multipart upload limits",
                "Build REST endpoints to accept file uploads up to 25MB, save with UUID signatures, and serve download streams.",
                "REVIEW",
                "MEDIUM",
                proj1.getId(),
                david.getId(),
                david.getName(),
                david.getAvatarUrl(),
                LocalDate.now().plusDays(2),
                6,
                "Backend,Storage,Files",
                4
        );
        t4.setLoggedHours(5);
        taskRepository.save(t4);

        Task t5 = new Task(
                "Set up Docker compose file & Kubernetes manifests",
                "Create production-ready Dockerfile and Helm charts for zero-downtime rolling deployments.",
                "TODO",
                "LOW",
                proj1.getId(),
                priya.getId(),
                priya.getName(),
                priya.getAvatarUrl(),
                LocalDate.now().plusDays(10),
                10,
                "DevOps,Docker,K8s",
                5
        );
        taskRepository.save(t5);

        // 4. Create Tasks for Project 2 (Mobile App)
        Task m1 = new Task(
                "Design Figma dark-theme tokens and interactive components",
                "Standardize color palettes, glassmorphism card elevation, and accessible contrast ratios.",
                "DONE",
                "HIGH",
                proj2.getId(),
                elena.getId(),
                elena.getName(),
                elena.getAvatarUrl(),
                LocalDate.now().minusDays(3),
                20,
                "Design,Figma,Tokens",
                1
        );
        m1.setLoggedHours(20);
        taskRepository.save(m1);

        Task m2 = new Task(
                "Integrate biometrics auth and JWT session renewal",
                "Add FaceID and fingerprint biometric authentication with secure keychain credential storage.",
                "IN_PROGRESS",
                "URGENT",
                proj2.getId(),
                alex.getId(),
                alex.getName(),
                alex.getAvatarUrl(),
                LocalDate.now().plusDays(1),
                14,
                "Security,Auth,Mobile",
                2
        );
        m2.setLoggedHours(6);
        taskRepository.save(m2);

        Task m3 = new Task(
                "Offline cache sync with IndexedDB / local storage",
                "Enable full offline task management and sync queue reconciliation when network connectivity resumes.",
                "TODO",
                "MEDIUM",
                proj2.getId(),
                sarah.getId(),
                sarah.getName(),
                sarah.getAvatarUrl(),
                LocalDate.now().plusDays(7),
                18,
                "Frontend,Offline,PWA",
                3
        );
        taskRepository.save(m3);

        // 5. Add Comments
        Comment c1 = new Comment(
                t2.getId(),
                "Alex Morgan",
                alex.getAvatarUrl(),
                alex.getEmail(),
                "Awesome progress on the board drag interactions! Make sure we trigger the WebSocket status patch immediately."
        );
        commentRepository.save(c1);

        Comment c2 = new Comment(
                t2.getId(),
                "Sarah Chen",
                sarah.getAvatarUrl(),
                sarah.getEmail(),
                "Just tested the WebSocket broadcast across two browser tabs — the cards update in real-time under 50ms!"
        );
        commentRepository.save(c2);

        // 6. Add Attachments
        Attachment a1 = new Attachment(
                t2.getId(),
                "kanban_workflow_spec.pdf",
                "application/pdf",
                245760L,
                "/api/attachments/sample/kanban_workflow_spec.pdf",
                "kanban_workflow_spec.pdf",
                "Alex Morgan"
        );
        attachmentRepository.save(a1);

        Attachment a2 = new Attachment(
                t1.getId(),
                "websocket_stomp_architecture.png",
                "image/png",
                512000L,
                "/api/attachments/sample/websocket_stomp_architecture.png",
                "websocket_stomp_architecture.png",
                "Sarah Chen"
        );
        attachmentRepository.save(a2);
    }
}
