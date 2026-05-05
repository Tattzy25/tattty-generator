const API_BASE = import.meta.env.VITE_API_BASE as string;

export function getImageUrl(key: string) {
  return `${API_BASE}/download/${key}`;
}

export async function listModels(prefix?: string) {
  const url = prefix
    ? `${API_BASE}/list?prefix=${prefix}/`
    : `${API_BASE}/list`;
  const res = await fetch(url);
  const { objects } = await res.json();

  return (objects || []).map((obj: any) => ({
    key: obj.key,
    imageUrl: `${API_BASE}/download/${obj.key}`,
    modelName: obj.metadata?.modelName,
    artistName: obj.metadata?.artistName,
    triggerWord: obj.metadata?.triggerWord,
    description: obj.metadata?.description,
    tags: obj.metadata?.tags,
    starRatings: obj.metadata?.starRatings,
    coverImage: obj.metadata?.coverImage,
    versionId: obj.metadata?.versionId,
    userId: obj.metadata?.userId,
    gen_id: obj.metadata?.gen_id,
  }));
}

export async function getModelInfo(key: string) {
  const res = await fetch(`${API_BASE}/info/${key}`);
  return res.json();
}

export async function fetchModel(key: string) {
  const res = await fetch(`${API_BASE}/fetch?key=${key}`);
  return res.json();
}

export async function batchFetchModels(keys: string[]) {
  const res = await fetch(`${API_BASE}/batch-fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keys }),
  });
  return res.json();
}

export async function deleteModel(key: string) {
  const res = await fetch(`${API_BASE}/delete/${key}`, { method: 'DELETE' });
  return res.json();
}

export async function createModel(params: {
  prefix: string; modelName: string; artistName: string; triggerWord: string;
  description: string; tags: string; starRatings: string; coverImage: string;
  versionId: string; userId: string; gen_id: string;
}) {
  const res = await fetch(`${API_BASE}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function updateModel(params: {
  key: string; artistName?: string; triggerWord?: string; description?: string;
  tags?: string; starRatings?: string; coverImage?: string;
}) {
  const res = await fetch(`${API_BASE}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function uploadModel(params: {
  file: File; prefix: string; modelName: string; artistName: string;
  triggerWord: string; description: string; tags: string; starRatings: string;
  coverImage: File | string; versionId: string; userId: string; gen_id: string;
}) {
  const formData = new FormData();
  Object.entries(params).forEach(([k, v]) => formData.append(k, v as any));
  const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
  return res.json();
}

export async function uploadTraining(params: { file: File; prefix: string }) {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('prefix', params.prefix);
  const res = await fetch(`${API_BASE}/training/upload`, { method: 'POST', body: formData });
  return res.json();
}

export function getTrainingUrl(key: string) {
  return `${API_BASE}/training/download/${key}`;
}

export async function listTraining(prefix: string) {
  const res = await fetch(`${API_BASE}/training/list?prefix=${prefix}/`);
  return res.json();
}
