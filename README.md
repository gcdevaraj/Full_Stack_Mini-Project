# PulseTask — Project & Task Management Platform

A modern, full-stack, real-time Project and Task Management platform built with **React**, **Java Spring Boot 3**, **Spring Data JPA / H2 Database**, and **WebSocket STOMP** for real-time collaboration.

---

## ✨ Features Implemented

1. **Create Projects, Tasks, and Teams**
   - **Projects**: Define project codes (e.g. `CLOUD-101`), objectives, priorities, custom color themes, and assign responsible teams.
   - **Teams & Members**: Manage specialized squads, employee roles, contact info, and avatar profiles.
   - **Tasks**: Rich task creation with custom priorities, estimated effort hours, and tags.

2. **Assign Tasks & Set Deadlines**
   - Assign tasks directly to any team member.
   - Set deadlines with automatic overdue alerts and visual warning badges.
   - Real-time filters by Assignee, Priority (`Low`, `Medium`, `High`, `Urgent`), and text search.

3. **Kanban Boards & Progress Charts**
   - **Interactive Kanban Board**: 4 workflow states (`To Do`, `In Progress`, `In Review`, `Done`).
   - Native Drag-and-Drop + quick directional shift controls between columns.
   - **Progress & Performance Analytics**:
     - Visual segmented distribution bar (To Do vs In Progress vs In Review vs Done).
     - Priority distribution bars (`Urgent`, `High`, `Medium`, `Low`).
     - Project milestone velocity and completion percentage gauges.
     - Individual team member workload and task output analytics.

4. **Comments and File Attachments**
   - **Discussion Thread**: Task detail modal with real-time comments and author avatars.
   - **File Attachments**: Upload documents, specs, and mockups directly to tasks with file size formatting, secure local file storage, and download capabilities.

5. **Real-Time Updates via WebSockets (STOMP)**
   - Spring Boot WebSocket message broker configured on `/ws` with `/topic/updates` and `/topic/projects/{id}`.
   - Real-time broadcast whenever a task is created, dragged to a new status, updated, commented on, or has files attached.
   - Floating real-time toast notifications and pulsing live sync status indicator on the frontend.

6. **Relational Database & H2 Console**
   - JPA / Hibernate relational schema connecting Projects, Tasks, Teams, Members, Comments, and Attachments.
   - Seeded sample data initialized on startup for instant demonstration.
   - H2 Web Console accessible at `http://localhost:8080/h2-console`.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Lucide Icons, SockJS, StompJS, Vanilla CSS Design System |
| **Backend** | Java 17, Spring Boot 3.3.4, Spring Web MVC, Spring WebSocket (STOMP) |
| **Data & Persistence** | Spring Data JPA, Hibernate, H2 Database (In-Memory / Persistent) |
| **Tooling** | Maven Wrapper (`mvnw`), npm, Vite Dev Server |

---

## 🚀 Running the Project Locally

### 1. Backend (Spring Boot)
From the `backend` directory:
```bash
cd backend
./mvnw.cmd spring-boot:run   # On Windows
# or
./mvnw spring-boot:run       # On Linux/macOS
```
The backend starts at: **`http://localhost:8080`**  
H2 Console: **`http://localhost:8080/h2-console`** (JDBC URL: `jdbc:h2:mem:taskmasterdb`, user: `sa`, password: `password`)

### 2. Frontend (React + Vite)
From the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The frontend dev server runs at: **`http://localhost:5173`**

---

## 📡 REST API Summary

- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `GET /api/tasks?projectId={id}` - List tasks for a project
- `POST /api/tasks` - Create a task
- `PATCH /api/tasks/{id}/status` - Update task column status (Kanban movement)
- `GET /api/comments?taskId={id}` - Fetch task discussion comments
- `POST /api/comments` - Add a comment
- `POST /api/attachments/upload` - Upload file attachment (Multipart)
- `GET /api/attachments/download/{fileName}` - Download file attachment
- `GET /api/teams` - List all teams and members
- `POST /api/teams/{id}/members` - Add member to team
- `GET /api/dashboard/stats` - Fetch aggregate analytics
