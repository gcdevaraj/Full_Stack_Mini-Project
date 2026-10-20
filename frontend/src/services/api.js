const API_BASE = '/api';

export const api = {
  // Projects
  async getProjects() {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async getProject(id) {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
  },

  async createProject(project) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  async updateProject(id, project) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
  },

  async deleteProject(id) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete project');
    return true;
  },

  // Tasks
  async getTasks(projectId = null) {
    const url = projectId ? `${API_BASE}/tasks?projectId=${projectId}` : `${API_BASE}/tasks`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async getTask(id) {
    const res = await fetch(`${API_BASE}/tasks/${id}`);
    if (!res.ok) throw new Error('Failed to fetch task');
    return res.json();
  },

  async createTask(task) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  async updateTask(id, task) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  async updateTaskStatus(id, status, orderIndex = 0) {
    const res = await fetch(`${API_BASE}/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, orderIndex })
    });
    if (!res.ok) throw new Error('Failed to update task status');
    return res.json();
  },

  async deleteTask(id) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return true;
  },

  // Teams & Members
  async getTeams() {
    const res = await fetch(`${API_BASE}/teams`);
    if (!res.ok) throw new Error('Failed to fetch teams');
    return res.json();
  },

  async createTeam(team) {
    const res = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team)
    });
    if (!res.ok) throw new Error('Failed to create team');
    return res.json();
  },

  async updateTeam(id, team) {
    const res = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team)
    });
    if (!res.ok) throw new Error('Failed to update team');
    return res.json();
  },

  async deleteTeam(id) {
    const res = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete team');
    return true;
  },

  async getMembers() {
    const res = await fetch(`${API_BASE}/teams/members`);
    if (!res.ok) throw new Error('Failed to fetch members');
    return res.json();
  },

  async addMember(teamId, member) {
    const res = await fetch(`${API_BASE}/teams/${teamId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });
    if (!res.ok) throw new Error('Failed to add member');
    return res.json();
  },

  async removeMember(memberId) {
    const res = await fetch(`${API_BASE}/teams/members/${memberId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to remove member');
    return true;
  },

  // Comments
  async getComments(taskId) {
    const res = await fetch(`${API_BASE}/comments?taskId=${taskId}`);
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
  },

  async addComment(comment) {
    const res = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
  },

  async deleteComment(id) {
    const res = await fetch(`${API_BASE}/comments/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete comment');
    return true;
  },

  // Attachments
  async getAttachments(taskId) {
    const res = await fetch(`${API_BASE}/attachments?taskId=${taskId}`);
    if (!res.ok) throw new Error('Failed to fetch attachments');
    return res.json();
  },

  async uploadAttachment(taskId, file, uploadedBy = 'Alex Morgan') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);
    formData.append('uploadedBy', uploadedBy);

    const res = await fetch(`${API_BASE}/attachments/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload attachment');
    return res.json();
  },

  async deleteAttachment(id) {
    const res = await fetch(`${API_BASE}/attachments/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete attachment');
    return true;
  },

  // Dashboard Stats
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  }
};
