import React, { useState } from 'react';
import { Users, Plus, Mail, Shield, Trash2, UserPlus, X } from 'lucide-react';

export default function TeamManagementView({ 
  teams, 
  members, 
  tasks,
  onCreateTeam, 
  onDeleteTeam, 
  onAddMember, 
  onRemoveMember 
}) {
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  // New Team Form state
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    color: '#6366f1'
  });

  // New Member Form state
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'Frontend Engineer',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
  });

  const handleCreateTeamSubmit = (e) => {
    e.preventDefault();
    if (!newTeam.name.trim()) return;
    onCreateTeam(newTeam);
    setNewTeam({ name: '', description: '', color: '#6366f1' });
    setShowTeamModal(false);
  };

  const handleAddMemberSubmit = (e) => {
    e.preventDefault();
    if (!newMember.name.trim() || !selectedTeamId) return;
    onAddMember(selectedTeamId, newMember);
    setNewMember({
      name: '',
      email: '',
      role: 'Frontend Engineer',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
    });
    setShowMemberModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
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
            Teams & Workforce Roster
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage departments, cross-functional squads, and assign project roles.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setShowTeamModal(true)}>
          <Plus size={16} />
          <span>Create New Team</span>
        </button>
      </div>

      {/* Teams Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        {teams.map(team => {
          const teamMembers = members.filter(m => m.team?.id === team.id || m.teamId === team.id);

          return (
            <div key={team.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Team Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '10px', 
                      background: team.color || '#6366f1', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: 'white' 
                    }}
                  >
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                      {team.name}
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {team.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                    onClick={() => {
                      setSelectedTeamId(team.id);
                      setShowMemberModal(true);
                    }}
                  >
                    <UserPlus size={14} />
                    <span>Add Member</span>
                  </button>
                  <button 
                    className="btn-icon" 
                    title="Delete Team" 
                    onClick={() => {
                      if (window.confirm(`Delete team "${team.name}"?`)) onDeleteTeam(team.id);
                    }}
                    style={{ color: '#fb7185' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active Members ({teamMembers.length})
                </div>

                {teamMembers.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>No members in this team yet.</p>
                ) : (
                  teamMembers.map(m => {
                    const assignedTasks = tasks.filter(t => t.assigneeId === m.id);
                    const completedTasks = assignedTasks.filter(t => t.status === 'DONE');

                    return (
                      <div 
                        key={m.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {m.avatarUrl ? (
                            <img src={m.avatarUrl} alt={m.name} className="avatar-circle" style={{ width: '34px', height: '34px' }} />
                          ) : (
                            <div className="avatar-fallback" style={{ width: '34px', height: '34px' }}>{m.name.charAt(0)}</div>
                          )}
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                              {m.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Shield size={12} color="#818cf8" />
                              <span>{m.role || 'Member'}</span>
                              <span>•</span>
                              <span>{m.email}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                            {completedTasks.length}/{assignedTasks.length} tasks resolved
                          </span>
                          <button 
                            className="btn-icon" 
                            title="Remove Member"
                            onClick={() => onRemoveMember(m.id)}
                            style={{ width: '26px', height: '26px', color: '#fb7185' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Team Modal */}
      {showTeamModal && (
        <div className="modal-overlay" onClick={() => setShowTeamModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Team</h2>
              <button className="btn-icon" onClick={() => setShowTeamModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateTeamSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Team Name *</label>
                  <input 
                    type="text" 
                    className="text-input" 
                    placeholder="e.g. AI Research Group"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="text-input" 
                    rows={2}
                    placeholder="Purpose, responsibilities, or department..."
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowTeamModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Team</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Team Member</h2>
              <button className="btn-icon" onClick={() => setShowMemberModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddMemberSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    className="text-input" 
                    placeholder="e.g. Liam Anderson"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input 
                    type="email" 
                    className="text-input" 
                    placeholder="liam@company.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role Title</label>
                  <input 
                    type="text" 
                    className="text-input" 
                    placeholder="e.g. Senior Backend Engineer"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Avatar Image URL</label>
                  <input 
                    type="url" 
                    className="text-input" 
                    value={newMember.avatarUrl}
                    onChange={(e) => setNewMember({ ...newMember, avatarUrl: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
