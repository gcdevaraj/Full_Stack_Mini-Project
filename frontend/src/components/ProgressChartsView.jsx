import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Layers,
  Award
} from 'lucide-react';

export default function ProgressChartsView({ 
  stats, 
  projects, 
  tasks, 
  members 
}) {
  const totalTasks = tasks.length || 1;

  // Status counts
  const todoCount = tasks.filter(t => t.status === 'TODO').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const reviewCount = tasks.filter(t => t.status === 'REVIEW').length;
  const doneCount = tasks.filter(t => t.status === 'DONE').length;

  const todoPct = Math.round((todoCount / totalTasks) * 100);
  const inProgressPct = Math.round((inProgressCount / totalTasks) * 100);
  const reviewPct = Math.round((reviewCount / totalTasks) * 100);
  const donePct = Math.round((doneCount / totalTasks) * 100);

  // Priority counts
  const lowCount = tasks.filter(t => t.priority === 'LOW').length;
  const mediumCount = tasks.filter(t => t.priority === 'MEDIUM').length;
  const highCount = tasks.filter(t => t.priority === 'HIGH').length;
  const urgentCount = tasks.filter(t => t.priority === 'URGENT').length;

  // Hours metrics
  const totalEstHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const totalLoggedHours = tasks.reduce((sum, t) => sum + (t.loggedHours || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '24px 30px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '16px' 
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '6px' }}>
            Progress & Performance Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Real-time delivery burndown, workload distribution, and milestone tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Total Effort Logged</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>{totalLoggedHours} / {totalEstHours} hrs</div>
          </div>
        </div>
      </div>

      {/* Top 2 Visual Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Status Distribution Segmented Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <PieChart size={18} color="#38bdf8" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Workflow Status Distribution
            </h2>
          </div>

          {/* Segmented Progress Bar */}
          <div style={{ height: '24px', display: 'flex', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px', background: 'rgba(255, 255, 255, 0.05)' }}>
            <div style={{ width: `${todoPct}%`, background: '#64748b' }} title={`To Do: ${todoCount} (${todoPct}%)`} />
            <div style={{ width: `${inProgressPct}%`, background: '#38bdf8' }} title={`In Progress: ${inProgressCount} (${inProgressPct}%)`} />
            <div style={{ width: `${reviewPct}%`, background: '#fbbf24' }} title={`In Review: ${reviewCount} (${reviewPct}%)`} />
            <div style={{ width: `${donePct}%`, background: '#34d399' }} title={`Done: ${doneCount} (${donePct}%)`} />
          </div>

          {/* Legend Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', borderLeft: '4px solid #64748b' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>To Do (Backlog)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>{todoCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>({todoPct}%)</span></div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In Progress</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>{inProgressCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>({inProgressPct}%)</span></div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', borderLeft: '4px solid #fbbf24' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In Review</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>{reviewCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>({reviewPct}%)</span></div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', borderLeft: '4px solid #34d399' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Done / Resolved</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>{doneCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>({donePct}%)</span></div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown Bar Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <BarChart3 size={18} color="#ec4899" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Priority Distribution
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Urgent */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: '#fb7185', fontWeight: 600 }}>Urgent</span>
                <span style={{ color: 'var(--text-muted)' }}>{urgentCount} tasks</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(urgentCount / totalTasks) * 100}%`, height: '100%', background: '#f43f5e', borderRadius: '999px' }} />
              </div>
            </div>

            {/* High */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>High</span>
                <span style={{ color: 'var(--text-muted)' }}>{highCount} tasks</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(highCount / totalTasks) * 100}%`, height: '100%', background: '#f59e0b', borderRadius: '999px' }} />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>Medium</span>
                <span style={{ color: 'var(--text-muted)' }}>{mediumCount} tasks</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(mediumCount / totalTasks) * 100}%`, height: '100%', background: '#38bdf8', borderRadius: '999px' }} />
              </div>
            </div>

            {/* Low */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Low</span>
                <span style={{ color: 'var(--text-muted)' }}>{lowCount} tasks</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(lowCount / totalTasks) * 100}%`, height: '100%', background: '#64748b', borderRadius: '999px' }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Project Completion Progress Detail */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Layers size={18} color="#10b981" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            Project Completion Velocity & Deadlines
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {projects.map(p => {
            const pTasks = tasks.filter(t => t.projectId === p.id);
            const pDone = pTasks.filter(t => t.status === 'DONE').length;
            const pct = pTasks.length ? Math.round((pDone / pTasks.length) * 100) : (p.progress || 0);

            return (
              <div 
                key={p.id}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: '10px', 
                  padding: '16px 20px' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: p.color || '#6366f1' }}>
                      {p.code}
                    </span>
                    <span style={{ fontWeight: 700, color: 'white' }}>{p.name}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Target: {p.endDate || 'Ongoing'}</span>
                    <span style={{ fontWeight: 700, color: pct === 100 ? '#10b981' : '#f8fafc' }}>{pct}% Completed</span>
                  </div>
                </div>

                <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${pct}%`, 
                      height: '100%', 
                      background: `linear-gradient(90deg, ${p.color || '#6366f1'}, #10b981)`,
                      borderRadius: '999px',
                      transition: 'width 0.4s ease'
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Member Workload Chart */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Award size={18} color="#a855f7" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            Team Workload & Output
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {members.map(m => {
            const mTasks = tasks.filter(t => t.assigneeId === m.id);
            const mDone = mTasks.filter(t => t.status === 'DONE').length;
            const completionRate = mTasks.length ? Math.round((mDone / mTasks.length) * 100) : 0;

            return (
              <div 
                key={m.id}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: '10px', 
                  padding: '16px' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  {m.avatarUrl ? (
                    <img src={m.avatarUrl} alt={m.name} className="avatar-circle" style={{ width: '32px', height: '32px' }} />
                  ) : (
                    <div className="avatar-fallback" style={{ width: '32px', height: '32px' }}>{m.name.charAt(0)}</div>
                  )}
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>{m.name}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{m.role}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '4px' }}>
                  <span>Tasks: {mDone} done / {mTasks.length} assigned</span>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{completionRate}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${completionRate}%`, height: '100%', background: '#6366f1', borderRadius: '999px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
