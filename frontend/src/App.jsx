import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import KanbanBoard from './components/KanbanBoard';
import ProgressChartsView from './components/ProgressChartsView';
import TeamManagementView from './components/TeamManagementView';
import TaskDetailModal from './components/TaskDetailModal';
import NewTaskModal from './components/NewTaskModal';
import ProjectModal from './components/ProjectModal';
import ToastManager from './components/ToastManager';
import { api } from './services/api';
import { wsService } from './services/websocket';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Modals state
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskInitialColumn, setNewTaskInitialColumn] = useState('TODO');
  const [showProjectModal, setShowProjectModal] = useState(false);

  // WebSocket and Real-time state
  const [wsConnected, setWsConnected] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add toast helper
  const addToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [{ id, type, title, message }, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load all initial data from REST API
  const refreshData = useCallback(async () => {
    try {
      const [projData, taskData, teamData, memberData, statData] = await Promise.all([
        api.getProjects(),
        api.getTasks(),
        api.getTeams(),
        api.getMembers(),
        api.getDashboardStats()
      ]);

      setProjects(projData);
      setTasks(taskData);
      setTeams(teamData);
      setMembers(memberData);
      setStats(statData);

      if (projData.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projData[0].id);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  // Connect WebSocket and setup listeners
  useEffect(() => {
    refreshData();

    // Connect WebSocket STOMP
    wsService.connect();

    const unsubStatus = wsService.addStatusListener((status) => {
      setWsConnected(status);
    });

    const unsubMsg = wsService.addMessageListener((wsMsg) => {
      // console.log('Received real-time event:', wsMsg);
      // Append to live activity stream
      setActivityFeed(prev => [{
        message: wsMsg.message || `${wsMsg.type} on ${wsMsg.entity}`,
        type: wsMsg.type,
        timestamp: wsMsg.timestamp || Date.now()
      }, ...prev.slice(0, 20)]);

      // Show real-time notification toast
      addToast(wsMsg.type, wsMsg.type.replace(/_/g, ' '), wsMsg.message || 'Entity updated');

      // Refresh data
      refreshData();
    });

    return () => {
      unsubStatus();
      unsubMsg();
      wsService.disconnect();
    };
  }, []);

  // Update WebSocket project subscription when project selection changes
  useEffect(() => {
    if (selectedProjectId) {
      wsService.subscribeToProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Project Actions
  const handleCreateProject = async (projectData) => {
    try {
      const created = await api.createProject(projectData);
      setProjects(prev => [...prev, created]);
      setSelectedProjectId(created.id);
      addToast('PROJECT_CREATED', 'Project Created', `Project "${created.name}" created successfully`);
      refreshData();
    } catch (err) {
      console.error('Failed to create project:', err);
      alert('Failed to create project: ' + err.message);
    }
  };

  // Task Actions
  const handleCreateTask = async (taskData) => {
    try {
      const created = await api.createTask(taskData);
      setTasks(prev => [...prev, created]);
      addToast('TASK_CREATED', 'Task Created', `Task "${created.title}" added to board`);
      refreshData();
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task: ' + err.message);
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      const saved = await api.updateTask(updatedTask.id, updatedTask);
      setTasks(prev => prev.map(t => t.id === saved.id ? saved : t));
      addToast('TASK_UPDATED', 'Task Updated', `Task "${saved.title}" updated`);
      refreshData();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await api.updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error('Failed to update task status:', err);
      refreshData(); // revert if failed
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      addToast('TASK_DELETED', 'Task Deleted', 'Task was successfully removed');
      refreshData();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Team Actions
  const handleCreateTeam = async (teamData) => {
    try {
      const created = await api.createTeam(teamData);
      setTeams(prev => [...prev, created]);
      addToast('TEAM_CREATED', 'Team Created', `Team "${created.name}" added`);
      refreshData();
    } catch (err) {
      console.error('Failed to create team:', err);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await api.deleteTeam(teamId);
      setTeams(prev => prev.filter(t => t.id !== teamId));
      refreshData();
    } catch (err) {
      console.error('Failed to delete team:', err);
    }
  };

  const handleAddMember = async (teamId, memberData) => {
    try {
      const created = await api.addMember(teamId, memberData);
      setMembers(prev => [...prev, created]);
      addToast('MEMBER_ADDED', 'Member Added', `${created.name} added to team roster`);
      refreshData();
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await api.removeMember(memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
      refreshData();
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const openNewTaskModal = (projId = null, status = 'TODO') => {
    if (projId) setSelectedProjectId(projId);
    setNewTaskInitialColumn(status);
    setShowNewTaskModal(true);
  };

  const handleSelectProjectFromDashboard = (projId) => {
    setSelectedProjectId(projId);
    setCurrentTab('kanban');
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1d', color: '#818cf8', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Loading Workspace & Tasks...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        wsConnected={wsConnected}
        onNewTask={() => openNewTaskModal(selectedProjectId, 'TODO')}
        onNewProject={() => setShowProjectModal(true)}
      />

      {/* Main View Area */}
      <main className="main-content">
        {currentTab === 'dashboard' && (
          <DashboardView 
            stats={stats}
            projects={projects}
            tasks={tasks}
            teams={teams}
            onSelectProject={handleSelectProjectFromDashboard}
            onSelectTask={(task) => setSelectedTask(task)}
            onNewTask={() => openNewTaskModal(selectedProjectId, 'TODO')}
            activityFeed={activityFeed}
          />
        )}

        {currentTab === 'kanban' && (
          <KanbanBoard 
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={(id) => setSelectedProjectId(Number(id))}
            tasks={tasks}
            members={members}
            onTaskStatusChange={handleTaskStatusChange}
            onSelectTask={(task) => setSelectedTask(task)}
            onNewTask={(projId, col) => openNewTaskModal(projId, col)}
          />
        )}

        {currentTab === 'analytics' && (
          <ProgressChartsView 
            stats={stats}
            projects={projects}
            tasks={tasks}
            members={members}
          />
        )}

        {currentTab === 'teams' && (
          <TeamManagementView 
            teams={teams}
            members={members}
            tasks={tasks}
            onCreateTeam={handleCreateTeam}
            onDeleteTeam={handleDeleteTeam}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
        )}
      </main>

      {/* Task Details & Discussion Modal */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask}
          members={members}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* Create Task Modal */}
      {showNewTaskModal && (
        <NewTaskModal 
          projects={projects}
          members={members}
          defaultProjectId={selectedProjectId}
          defaultStatus={newTaskInitialColumn}
          onClose={() => setShowNewTaskModal(false)}
          onCreateTask={handleCreateTask}
        />
      )}

      {/* Create Project Modal */}
      {showProjectModal && (
        <ProjectModal 
          teams={teams}
          onClose={() => setShowProjectModal(false)}
          onSave={handleCreateProject}
        />
      )}

      {/* Real-time Toasts */}
      <ToastManager toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
