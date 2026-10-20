import React from 'react';
import { 
  Kanban, 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Plus, 
  FolderPlus, 
  Radio
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  wsConnected, 
  onNewTask, 
  onNewProject 
}) {
  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => setCurrentTab('dashboard')}>
        <div className="nav-brand-icon">
          <Kanban size={20} />
        </div>
        <span>PulseTask Pro</span>
      </div>

      <nav className="nav-tabs">
        <button 
          className={`nav-tab-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </button>

        <button 
          className={`nav-tab-btn ${currentTab === 'kanban' ? 'active' : ''}`}
          onClick={() => setCurrentTab('kanban')}
        >
          <Kanban size={16} />
          <span>Kanban Board</span>
        </button>

        <button 
          className={`nav-tab-btn ${currentTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setCurrentTab('analytics')}
        >
          <BarChart3 size={16} />
          <span>Progress & Analytics</span>
        </button>

        <button 
          className={`nav-tab-btn ${currentTab === 'teams' ? 'active' : ''}`}
          onClick={() => setCurrentTab('teams')}
        >
          <Users size={16} />
          <span>Teams & Members</span>
        </button>
      </nav>

      <div className="nav-actions">
        {/* Real-time WebSocket Status Badge */}
        <div 
          className={`ws-badge ${!wsConnected ? 'disconnected' : ''}`}
          title={wsConnected ? "WebSocket Connected: Real-time sync active" : "Connecting to WebSocket server..."}
        >
          <span className={`pulse-dot ${!wsConnected ? 'disconnected' : ''}`} />
          <span>{wsConnected ? 'Live Sync' : 'Reconnecting...'}</span>
        </div>

        <button className="btn-secondary" onClick={onNewProject} style={{ padding: '7px 12px', fontSize: '0.8rem' }}>
          <FolderPlus size={15} />
          <span>New Project</span>
        </button>

        <button className="btn-primary" onClick={onNewTask} style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
}
