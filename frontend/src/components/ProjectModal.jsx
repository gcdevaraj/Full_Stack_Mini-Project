import React, { useState } from 'react';
import { X, FolderPlus, Save } from 'lucide-react';

export default function ProjectModal({ 
  project = null, 
  teams, 
  onClose, 
  onSave 
}) {
  const [formData, setFormData] = useState(
    project || {
      name: '',
      code: 'PRJ-' + Math.floor(100 + Math.random() * 900),
      description: '',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      color: '#6366f1',
      teamId: teams[0]?.id || 1,
      teamName: teams[0]?.name || 'Core Engineering',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  );

  const handleTeamChange = (teamId) => {
    const t = teams.find(team => String(team.id) === String(teamId));
    setFormData(prev => ({
      ...prev,
      teamId: Number(teamId),
      teamName: t ? t.name : 'Engineering'
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  const COLORS = ['#6366f1', '#ec4899', '#10b981', '#38bdf8', '#f59e0b', '#8b5cf6'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '580px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{project ? 'Edit Project' : 'Create New Project'}</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Project Name *</label>
                <input 
                  type="text" 
                  className="text-input" 
                  placeholder="e.g. NextGen Mobile Platform"
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Key *</label>
                <input 
                  type="text" 
                  className="text-input" 
                  placeholder="e.g. MOB"
                  value={formData.code} 
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="text-input" 
                rows={3}
                placeholder="High-level project objectives, milestones, and deliverables..."
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assigned Team</label>
                <select 
                  className="select-input" 
                  value={formData.teamId}
                  onChange={(e) => handleTeamChange(e.target.value)}
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select 
                  className="select-input" 
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input 
                  type="date" 
                  className="text-input" 
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Completion</label>
                <input 
                  type="date" 
                  className="text-input" 
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Color Accent Picker */}
            <div className="form-group">
              <label className="form-label">Theme Color</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {COLORS.map(c => (
                  <button 
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: c,
                      border: formData.color === c ? '2px solid white' : 'none',
                      cursor: 'pointer',
                      transform: formData.color === c ? 'scale(1.15)' : 'none',
                      transition: 'transform 0.15s ease'
                    }} 
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              <span>{project ? 'Save Project' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
