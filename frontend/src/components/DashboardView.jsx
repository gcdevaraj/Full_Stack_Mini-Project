import React from 'react';
import { 
  FolderKanban, 
  CheckCircle, 
  Clock, 
  Users, 
  ArrowUpRight, 
  Calendar, 
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Zap
} from 'lucide-react';

export default function DashboardView({ 
  stats, 
  projects, 
  tasks, 
  teams, 
  onSelectProject, 
  onSelectTask, 
  onNewTask,
  activityFeed
}) {
  // Sort tasks due soon
  const today = new Date().toISOString().split('T')[0];
  const upcomingTasks = tasks
    .filter(t => t.dueDate && t.status !== 'DONE')
    .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1))
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '28px 32px', 
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7), rgba(15, 23, 42, 0.8))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
            <Sparkles size={16} />
            <span>Workspace Overview</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', marginBottom: '8px' }}>
            Project & Task Management Hub
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '640px' }}>
            Monitor active sprints, track deadline progress, collaborate with your teams, and inspect live updates powered by Spring Boot & WebSocket STOMP.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" onClick={onNewTask}>
            <Zap size={16} />
            <span>Quick Create Task</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="glass-panel metric-card" style={{ '--card-accent': '#6366f1' }}>
          <div className="metric-header">
            <span className="metric-title">Active Projects</span>
            <div className="metric-icon-wrap" style={{ color: '#6366f1' }}>
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="metric-value">{stats?.totalProjects || projects.length}</div>
          <div className="metric-desc">
            {stats?.activeProjects || 0} active • {stats?.completedProjects || 0} completed
          </div>
        </div>

        <div className="glass-panel metric-card" style={{ '--card-accent': '#10b981' }}>
          <div className="metric-header">
            <span className="metric-title">Overall Completion</span>
            <div className="metric-icon-wrap" style={{ color: '#10b981' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="metric-value">{stats?.overallCompletionRate || 0}%</div>
          <div className="metric-desc">
            {stats?.doneTasks || 0} of {stats?.totalTasks || tasks.length} tasks resolved
          </div>
        </div>

        <div className="glass-panel metric-card" style={{ '--card-accent': '#38bdf8' }}>
          <div className="metric-header">
            <span className="metric-title">In Progress Tasks</span>
            <div className="metric-icon-wrap" style={{ color: '#38bdf8' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-value">{stats?.inProgressTasks || 0}</div>
          <div className="metric-desc">
            {stats?.reviewTasks || 0} pending code review
          </div>
        </div>

        <div className="glass-panel metric-card" style={{ '--card-accent': '#ec4899' }}>
          <div className="metric-header">
            <span className="metric-title">Team Members</span>
            <div className="metric-icon-wrap" style={{ color: '#ec4899' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="metric-value">{stats?.totalTeamMembers || teams.reduce((acc, t) => acc + (t.members?.length || 0), 0)}</div>
          <div className="metric-desc">
            Across {teams.length} specialized squads
          </div>
        </div>
      </div>

      {/* Two Column Layout: Projects list & Deadlines / Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        
        {/* Projects Cards Section */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white' }}>
              Active Projects
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Click a project to view its Kanban board
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {projects.map((proj) => {
              const projectTasks = tasks.filter(t => t.projectId === proj.id);
              const doneCount = projectTasks.filter(t => t.status === 'DONE').length;
              const progressPct = projectTasks.length ? Math.round((doneCount / projectTasks.length) * 100) : (proj.progress || 0);

              return (
                <div 
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.borderColor = proj.color || '#6366f1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span 
                          style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            background: `${proj.color || '#6366f1'}22`, 
                            color: proj.color || '#6366f1',
                            fontFamily: 'var(--font-mono)'
                          }}
                        >
                          {proj.code}
                        </span>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                          {proj.name}
                        </h3>
                      </div>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {proj.description?.length > 100 ? `${proj.description.slice(0, 100)}...` : proj.description}
                      </p>
                    </div>
                    <ArrowUpRight size={18} color="var(--text-subtle)" />
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>Progress ({doneCount}/{projectTasks.length} tasks)</span>
                      <span style={{ fontWeight: 600, color: progressPct === 100 ? '#10b981' : '#f8fafc' }}>{progressPct}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${progressPct}%`, 
                          background: `linear-gradient(90deg, ${proj.color || '#6366f1'}, #10b981)`,
                          borderRadius: '999px',
                          transition: 'width 0.4s ease'
                        }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deadlines & Live Activity Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Upcoming Deadlines */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Clock size={18} color="#f59e0b" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>
                Upcoming Deadlines
              </h2>
            </div>

            {upcomingTasks.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>No upcoming deadlines due.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcomingTasks.map((t) => {
                  const isOverdue = t.dueDate < today;
                  return (
                    <div 
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                    >
                      <div style={{ overflow: 'hidden', paddingRight: '8px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{t.assigneeName || 'Unassigned'}</span>
                        </div>
                      </div>

                      <div 
                        style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: isOverdue ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.12)',
                          color: isOverdue ? '#fb7185' : '#fbbf24'
                        }}
                      >
                        {isOverdue && <AlertTriangle size={12} />}
                        <span>{t.dueDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Real-time WebSocket Activity Feed */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="#38bdf8" />
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>
                  Live Activity Feed
                </h2>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>● Real-time</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
              {activityFeed.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>Waiting for real-time WebSocket events...</p>
              ) : (
                activityFeed.slice(0, 6).map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderLeft: '3px solid #6366f1',
                      borderRadius: '0 6px 6px 0',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ color: '#f1f5f9', fontWeight: 500 }}>
                      {item.message}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                      {new Date(item.timestamp || Date.now()).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
