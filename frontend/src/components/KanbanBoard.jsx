import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  User,
  SlidersHorizontal
} from 'lucide-react';

const COLUMNS = [
  { id: 'TODO', label: 'To Do', color: '#94a3b8' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#38bdf8' },
  { id: 'REVIEW', label: 'In Review', color: '#fbbf24' },
  { id: 'DONE', label: 'Done', color: '#34d399' }
];

export default function KanbanBoard({ 
  projects, 
  selectedProjectId, 
  onSelectProject, 
  tasks, 
  members, 
  onTaskStatusChange, 
  onSelectTask, 
  onNewTask 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const selectedProject = projects.find(p => p.id === Number(selectedProjectId)) || projects[0];

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (selectedProjectId && task.projectId !== Number(selectedProjectId)) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = task.title?.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTag = task.tags?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }
    if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'ALL' && String(task.assigneeId) !== String(assigneeFilter)) return false;
    return true;
  });

  // Drag and drop handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e, columnId) => {
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onTaskStatusChange(Number(taskId), targetStatus);
    }
    setDraggedTaskId(null);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Filter and Project Selector Bar */}
      <div className="kanban-controls glass-panel" style={{ padding: '16px 20px' }}>
        
        {/* Project Selector */}
        <div className="project-selector">
          <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>Project:</label>
          <select 
            className="select-input" 
            value={selectedProjectId || ''} 
            onChange={(e) => onSelectProject(e.target.value)}
            style={{ fontWeight: 600, color: '#f8fafc' }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
            ))}
          </select>
          {selectedProject && (
            <span 
              style={{ 
                fontSize: '0.75rem', 
                padding: '4px 10px', 
                borderRadius: '6px', 
                background: `${selectedProject.color || '#6366f1'}22`, 
                color: selectedProject.color || '#6366f1',
                fontWeight: 600 
              }}
            >
              Team: {selectedProject.teamName || 'Engineering'}
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="filter-group">
          {/* Search Box */}
          <div className="search-box">
            <Search size={16} />
            <input 
              type="text" 
              className="text-input" 
              placeholder="Search tasks or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Priority filter */}
          <select 
            className="select-input"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          {/* Assignee filter */}
          <select 
            className="select-input"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="ALL">All Assignees</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <button 
            className="btn-primary" 
            onClick={() => onNewTask(selectedProject?.id)}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>

      </div>

      {/* Kanban Board Columns */}
      <div className="kanban-grid">
        {COLUMNS.map(column => {
          const colTasks = filteredTasks.filter(t => t.status === column.id);
          const isOver = dragOverColumn === column.id;

          return (
            <div 
              key={column.id} 
              className={`kanban-column ${isOver ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={(e) => handleDragLeave(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="kanban-column-header">
                <div className="column-title-wrap">
                  <span className="column-dot" style={{ backgroundColor: column.color }} />
                  <span className="column-title">{column.label}</span>
                  <span className="column-badge">{colTasks.length}</span>
                </div>
                
                <button 
                  className="btn-icon" 
                  title={`Add task in ${column.label}`}
                  onClick={() => onNewTask(selectedProject?.id, column.id)}
                  style={{ width: '28px', height: '28px' }}
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Task Cards list */}
              <div className="task-list">
                {colTasks.length === 0 ? (
                  <div style={{ 
                    padding: '30px 10px', 
                    textAlign: 'center', 
                    color: 'var(--text-subtle)', 
                    fontSize: '0.8rem',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: '8px'
                  }}>
                    Drop cards here
                  </div>
                ) : (
                  colTasks.map(task => {
                    const isDragging = draggedTaskId === task.id;
                    const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'DONE';
                    const priorityClass = (task.priority || 'medium').toLowerCase();

                    return (
                      <div 
                        key={task.id} 
                        className={`task-card ${isDragging ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => onSelectTask(task)}
                      >
                        {/* Top Meta: Priority & Status Quick Controls */}
                        <div className="task-card-header">
                          <span className={`priority-tag ${priorityClass}`}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                            {task.priority || 'MEDIUM'}
                          </span>

                          {/* Quick Move Buttons */}
                          <div style={{ display: 'flex', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                            {column.id !== 'TODO' && (
                              <button 
                                className="btn-icon" 
                                style={{ width: '22px', height: '22px', padding: 0 }}
                                title="Move Left"
                                onClick={() => {
                                  const idx = COLUMNS.findIndex(c => c.id === column.id);
                                  if (idx > 0) onTaskStatusChange(task.id, COLUMNS[idx - 1].id);
                                }}
                              >
                                <ChevronLeft size={12} />
                              </button>
                            )}
                            {column.id !== 'DONE' && (
                              <button 
                                className="btn-icon" 
                                style={{ width: '22px', height: '22px', padding: 0 }}
                                title="Move Right"
                                onClick={() => {
                                  const idx = COLUMNS.findIndex(c => c.id === column.id);
                                  if (idx < COLUMNS.length - 1) onTaskStatusChange(task.id, COLUMNS[idx + 1].id);
                                }}
                              >
                                <ChevronRight size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <div className="task-card-title">{task.title}</div>

                        {/* Description Preview */}
                        {task.description && (
                          <div className="task-card-desc">{task.description}</div>
                        )}

                        {/* Tags */}
                        {task.tags && (
                          <div className="tag-list">
                            {task.tags.split(',').map((tag, i) => (
                              <span key={i} className="tag-chip">#{tag.trim()}</span>
                            ))}
                          </div>
                        )}

                        {/* Footer info: Due date, Assignee, Hours */}
                        <div className="task-card-footer">
                          <div className="task-meta-left">
                            {task.dueDate && (
                              <div className={`task-meta-item ${isOverdue ? 'overdue' : ''}`} title={isOverdue ? 'Overdue!' : 'Due Date'}>
                                <Calendar size={13} />
                                <span>{task.dueDate}</span>
                              </div>
                            )}

                            {task.estimatedHours > 0 && (
                              <div className="task-meta-item" title="Estimated Hours">
                                <Clock size={13} />
                                <span>{task.estimatedHours}h</span>
                              </div>
                            )}
                          </div>

                          {/* Assignee Avatar */}
                          <div>
                            {task.assigneeAvatar ? (
                              <img 
                                src={task.assigneeAvatar} 
                                alt={task.assigneeName || 'Assignee'} 
                                className="avatar-circle"
                                title={task.assigneeName || 'Assignee'}
                              />
                            ) : task.assigneeName ? (
                              <div className="avatar-fallback" title={task.assigneeName}>
                                {task.assigneeName.charAt(0)}
                              </div>
                            ) : (
                              <div className="avatar-fallback" style={{ background: '#334155' }} title="Unassigned">
                                <User size={12} />
                              </div>
                            )}
                          </div>
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
    </div>
  );
}
