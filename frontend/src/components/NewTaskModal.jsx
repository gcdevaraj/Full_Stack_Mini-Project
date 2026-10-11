import React, { useState } from 'react';
import { X, Plus, Calendar, User, Tag, Clock } from 'lucide-react';

export default function NewTaskModal({ 
  projects, 
  members, 
  defaultProjectId, 
  defaultStatus, 
  onClose, 
  onCreateTask 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: defaultStatus || 'TODO',
    priority: 'MEDIUM',
    projectId: defaultProjectId || (projects[0]?.id || 1),
    assigneeId: members[0]?.id || null,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ahead
    estimatedHours: 8,
    tags: 'Feature,UI'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const selectedMember = members.find(m => String(m.id) === String(formData.assigneeId));

    onCreateTask({
      ...formData,
      projectId: Number(formData.projectId),
      assigneeId: selectedMember ? selectedMember.id : null,
      assigneeName: selectedMember ? selectedMember.name : null,
      assigneeAvatar: selectedMember ? selectedMember.avatarUrl : null,
      estimatedHours: Number(formData.estimatedHours) || 0
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '600px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Create New Task</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input 
                type="text" 
                className="text-input" 
                placeholder="e.g. Implement authentication tokens"
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required 
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="text-input" 
                rows={3}
                placeholder="Provide detailed context, requirements or steps..."
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Project & Status */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Project</label>
                <select 
                  className="select-input" 
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select 
                  className="select-input" 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </div>

            {/* Priority & Assignee */}
            <div className="form-row">
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

              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select 
                  className="select-input" 
                  value={formData.assigneeId || ''}
                  onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Deadline & Hours */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Deadline (Due Date)</label>
                <input 
                  type="date" 
                  className="text-input" 
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Est. Hours</label>
                <input 
                  type="number" 
                  className="text-input" 
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input 
                type="text" 
                className="text-input" 
                placeholder="Frontend, UX, Bug"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={16} />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
