const API_URL = 'https://digiboard-7v13.onrender.com/api';

function getAuthHeaders() {
  const token = localStorage.getItem('digiboard_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function loginApi(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Login failed');
  }
  return res.json();
}

export async function signupApi(userData) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Signup failed');
  }
  return res.json();
}

export async function getMeApi() {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

export async function updateMeApi(userData) {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json();
}

// ---- NOTICES ----

export async function getNoticesApi() {
  const res = await fetch(`${API_URL}/notices`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch notices');
  return res.json();
}

export async function createNoticeApi(noticeData) {
  const res = await fetch(`${API_URL}/notices`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(noticeData)
  });
  if (!res.ok) throw new Error('Failed to create notice');
  return res.json();
}

export async function updateNoticeApi(id, noticeData) {
  const res = await fetch(`${API_URL}/notices/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(noticeData)
  });
  if (!res.ok) throw new Error('Failed to update notice');
  return res.json();
}

export async function deleteNoticeApi(id) {
  const res = await fetch(`${API_URL}/notices/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete notice');
  return res.json();
}

// ---- USERS (PUBLIC META) ----
export async function getUsersApi() {
  const res = await fetch(`${API_URL}/auth/users`, { headers: getAuthHeaders() });
  return res.ok ? res.json() : [];
}

export async function updateUserRoleApi(userId, role) {
  const res = await fetch(`${API_URL}/auth/users/${userId}/role`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role })
  });
  if (!res.ok) throw new Error('Failed to update role');
  return res.json();
}

// ---- BOOKMARKS ----
export async function getBookmarksApi() {
  const res = await fetch(`${API_URL}/bookmarks`, { headers: getAuthHeaders() });
  return res.ok ? res.json() : [];
}
export async function toggleBookmarkApi(noticeId, isBookmarked, existingId) {
  if (isBookmarked) {
    return fetch(`${API_URL}/bookmarks/${existingId}`, { method: 'DELETE', headers: getAuthHeaders() });
  } else {
    const id = `bm_${Date.now()}`;
    return fetch(`${API_URL}/bookmarks`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ id, noticeId })
    });
  }
}

// ---- COMMENTS ----
export async function getCommentsApi() {
  const res = await fetch(`${API_URL}/comments`, { headers: getAuthHeaders() });
  return res.ok ? res.json() : [];
}
export async function createCommentApi(commentData) {
  return fetch(`${API_URL}/comments`, {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(commentData)
  });
}

// ---- NOTIFICATIONS ----
export async function getNotificationsApi() {
  const res = await fetch(`${API_URL}/notifications`, { headers: getAuthHeaders() });
  return res.ok ? res.json() : [];
}
export async function createNotificationApi(data) {
  return fetch(`${API_URL}/notifications`, {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data)
  });
}
export async function markNotificationReadApi(id) {
  return fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'PUT', headers: getAuthHeaders()
  });
}
