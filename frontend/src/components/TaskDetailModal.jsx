import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Save, 
  Send, 
  Upload, 
  Paperclip, 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function TaskDetailModal({ 
  task, 
  members, 
  onClose, 
  onUpdateTask, 
  onDeleteTask 
}) {
  const [formData, setFormData] = useState({ ...task });
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('Alex Morgan');
  const [uploading, setUploading] = useState(false);
  const [loadingExtras, setLoadingExtras] = useState(true);

  // Load comments and attachments on mount or task change
  useEffect(() => {
    setFormData({ ...task });
    loadExtras();
  }, [task.id]);

  const loadExtras = async () => {
    try {
      setLoadingExtras(true);
      const [cRes, aRes] = await Promise.all([
        api.getComments(task.id),
        api.getAttachments(task.id)
      ]);
      setComments(cRes);
      setAttachments(aRes);
    } catch (err) {
      console.error('Failed to load comments/attachments:', err);
    } finally {
      setLoadingExtras(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAssigneeChange = (memberId) => {
    if (!memberId) {
      setFormData(prev => ({
        ...prev,
        assigneeId: null,
        assigneeName: null,
        assigneeAvatar: null
      }));
      return;
    }
    const mem = members.find(m => String(m.id) === String(memberId));
    if (mem) {
      setFormData(prev => ({
        ...prev,
        assigneeId: mem.id,
        assigneeName: mem.name,
        assigneeAvatar: mem.avatarUrl
      }));
    }
  };

  const handleSave = () => {
    onUpdateTask(formData);
    onClose();
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const activeMember = members.find(m => m.name === commentAuthor) || members[0];
      const comment = await api.addComment({
        taskId: task.id,
        authorName: commentAuthor,
        authorAvatar: activeMember?.avatarUrl || '',
        authorEmail: activeMember?.email || 'user@example.com',
        content: newComment.trim()
      });
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const att = await api.uploadAttachment(task.id, file, commentAuthor);
      setAttachments(prev => [att, ...prev]);
    } catch (err) {
      console.error('Failed to upload file:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await api.deleteAttachment(attachmentId);
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch (err) {
      console.error('Failed to delete attachment:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '820px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span 
              className={`priority-tag ${(formData.priority || 'medium').toLowerCase()}`}
            >
              {formData.priority}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
              Task #{task.id}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn-icon" 
              title="Delete Task" 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this task?')) {
                  onDeleteTask(task.id);
                  onClose();
                }
              }}
              style={{ color: '#fb7185' }}
            >
              <Trash2 size={16} />
            </button>
            <button className="btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Title Input */}
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input 
              type="text" 
              className="text-input" 
              value={formData.title} 
              onChange={(e) => handleInputChange('title', e.target.value)}
              style={{ fontSize: '1.05rem', fontWeight: 600 }}
            />
          </div>

          {/* Description Input */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="text-input" 
              rows={3}
              value={formData.description || ''} 
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add comprehensive specifications or acceptance criteria..."
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Metadata Grid */}
          <div className="form-row">
            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="select-input" 
                value={formData.status} 
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select 
                className="select-input" 
                value={formData.priority} 
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            {/* Assignee */}
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select 
                className="select-input" 
                value={formData.assigneeId || ''} 
                onChange={(e) => handleAssigneeChange(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role || 'Member'})</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label className="form-label">Deadline (Due Date)</label>
              <input 
                type="date" 
                className="text-input" 
                value={formData.dueDate || ''} 
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            {/* Hours */}
            <div className="form-group">
              <label className="form-label">Estimated Hours</label>
              <input 
                type="number" 
                className="text-input" 
                value={formData.estimatedHours || 0} 
                onChange={(e) => handleInputChange('estimatedHours', parseInt(e.target.value) || 0)}
              />
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">Tags (comma-separated)</label>
              <input 
                type="text" 
                className="text-input" 
                value={formData.tags || ''} 
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="Backend, API, HighPriority"
              />
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border-subtle)', margin: '10px 0' }} />

          {/* Attachments Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Paperclip size={18} color="#fbbf24" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  Attachments ({attachments.length})
                </h3>
              </div>

              {/* Upload Button */}
              <label className="btn-secondary" style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '0.8rem' }}>
                <Upload size={14} />
                <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                <input 
                  type="file" 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload} 
                  disabled={uploading}
                />
              </label>
            </div>

            {attachments.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>No files attached yet. Click 'Upload File' to attach documents or mockups.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {attachments.map(att => (
                  <div 
                    key={att.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <FileText size={18} color="#38bdf8" />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {att.fileName}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                          {formatFileSize(att.fileSize)} • by {att.uploadedBy}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <a 
                        href={`http://localhost:8080/api/attachments/download/${att.storagePath}`}
                        download={att.fileName}
                        className="btn-icon" 
                        title="Download" 
                        style={{ width: '26px', height: '26px' }}
                      >
                        <Download size={13} />
                      </a>
                      <button 
                        className="btn-icon" 
                        title="Delete" 
                        onClick={() => handleDeleteAttachment(att.id)}
                        style={{ width: '26px', height: '26px', color: '#fb7185' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr style={{ borderColor: 'var(--border-subtle)', margin: '10px 0' }} />

          {/* Comments Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <MessageSquare size={18} color="#38bdf8" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Discussion & Comments ({comments.length})
              </h3>
            </div>

            {/* Comment Post Box */}
            <form onSubmit={handleAddComment} style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <select 
                  className="select-input" 
                  value={commentAuthor} 
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  style={{ width: '180px', fontSize: '0.8rem' }}
                >
                  {members.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  className="text-input" 
                  placeholder="Write a comment or status update..."
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '8px 14px' }}>
                  <Send size={15} />
                </button>
              </div>
            </form>

            {/* Comment List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {comments.map(c => (
                <div 
                  key={c.id} 
                  style={{ 
                    padding: '12px 14px', 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    border: '1px solid var(--border-subtle)', 
                    borderRadius: '8px' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {c.authorAvatar ? (
                        <img src={c.authorAvatar} alt={c.authorName} className="avatar-circle" style={{ width: '22px', height: '22px' }} />
                      ) : (
                        <div className="avatar-fallback" style={{ width: '22px', height: '22px', fontSize: '0.65rem' }}>
                          {c.authorName?.charAt(0)}
                        </div>
                      )}
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                        {c.authorName}
                      </span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>

                    <button 
                      className="btn-icon" 
                      onClick={() => handleDeleteComment(c.id)}
                      style={{ width: '22px', height: '22px', color: 'var(--text-subtle)' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.45', paddingLeft: '30px' }}>
                    {c.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>

      </div>
    </div>
  );
}
