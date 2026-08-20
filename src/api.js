const API_BASE = '/api';

export const fetchAllData = async () => {
  const res = await fetch(`${API_BASE}/all`);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
};

export const updateCoupleApi = async (data) => {
  const res = await fetch(`${API_BASE}/couple`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const uploadImageApi = async (base64Image) => {
  // If it's already an external HTTP URL, don't upload to Cloudinary again
  if (!base64Image || base64Image.startsWith('http')) {
    return { url: base64Image };
  }

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image }),
  });
  if (!res.ok) throw new Error('Image upload failed');
  return res.json();
};

// Song APIs
export const addSongApi = async (songData) => {
  const res = await fetch(`${API_BASE}/songs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(songData),
  });
  return res.json();
};

export const deleteSongApi = async (id) => {
  const res = await fetch(`${API_BASE}/songs/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};

export const updateListeningStatusApi = async (statusData) => {
  const res = await fetch(`${API_BASE}/music/listening-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(statusData),
  });
  return res.json();
};

export const toggleSharedModeApi = async (isSharedMode) => {
  const res = await fetch(`${API_BASE}/music/toggle-shared-mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isSharedMode }),
  });
  return res.json();
};

export const dedicateSongApi = async (dedicateData) => {
  const res = await fetch(`${API_BASE}/music/dedicate-song`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dedicateData),
  });
  return res.json();
};

export const clearDedicatedSongApi = async () => {
  const res = await fetch(`${API_BASE}/music/clear-dedicated`, {
    method: 'DELETE',
  });
  return res.json();
};

// Milestone APIs
export const addMilestoneApi = async (data) => {
  const res = await fetch(`${API_BASE}/milestones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteMilestoneApi = async (id) => {
  const res = await fetch(`${API_BASE}/milestones/${id}`, { method: 'DELETE' });
  return res.json();
};

// Gallery APIs
export const addPhotoApi = async (data) => {
  const res = await fetch(`${API_BASE}/gallery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deletePhotoApi = async (id) => {
  const res = await fetch(`${API_BASE}/gallery/${id}`, { method: 'DELETE' });
  return res.json();
};

export const toggleLikePhotoApi = async (id) => {
  const res = await fetch(`${API_BASE}/gallery/${id}/like`, { method: 'PUT' });
  return res.json();
};

// Reminder APIs
export const addReminderApi = async (data) => {
  const res = await fetch(`${API_BASE}/reminders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteReminderApi = async (id) => {
  const res = await fetch(`${API_BASE}/reminders/${id}`, { method: 'DELETE' });
  return res.json();
};

// Love Note APIs
export const addNoteApi = async (data) => {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteNoteApi = async (id) => {
  const res = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
  return res.json();
};

// Bucket List APIs
export const addBucketItemApi = async (title) => {
  const res = await fetch(`${API_BASE}/bucket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return res.json();
};

export const toggleBucketItemApi = async (id) => {
  const res = await fetch(`${API_BASE}/bucket/${id}/toggle`, { method: 'PUT' });
  return res.json();
};
