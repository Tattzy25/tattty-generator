
export function getImageUrl(key: string) {
  return `https://cloudy.avi-kay2019.workers.dev/download/${key}`;
}

export async function listModels(cursor?: string) {
  const url = cursor
    ? `https://cloudy.avi-kay2019.workers.dev/list?limit=50&cursor=${cursor}`
    : `https://cloudy.avi-kay2019.workers.dev/list?limit=50`;
  const res = await fetch(url);
  const { objects, truncated, cursor: nextCursor } = await res.json();

  return {
    models: (objects || []).map((obj: any) => {
      const m = obj.metadata || {};
      return {
        key: obj.key,
        coverImage: m.coverimage || m.coverImage,
        modelName: m.modelname || m.modelName,
        artistName: m.artistname || m.artistName,
        triggerWord: m.triggerword || m.triggerWord,
        description: m.description,
        tags: m.tags,
        starRatings: m.starratings || m.starRatings,
        versionId: m.versionid || m.versionId,
        userId: m.userid || m.userId,
        gen_id: m.gen_id,
      };
    }),
    hasMore: truncated,
    nextCursor,
  };
}


export async function getModelInfo(key: string) {
  const res = await fetch(`https://cloudy.avi-kay2019.workers.dev/info/${key}`);
  return res.json();
}

export async function fetchModel(key: string) {
  const res = await fetch(`https://cloudy.avi-kay2019.workers.dev/fetch?key=${key}`);
  return res.json();
}

export async function batchFetchModels(keys: string[]) {
  const res = await fetch(`https://cloudy.avi-kay2019.workers.dev/batch-fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keys }),
  });
  return res.json();
}

export async function createModel(params: {
  prefix: string; modelName: string; artistName: string; triggerWord: string;
  description: string; tags: string; starRatings: string; coverImage: string;
  versionId: string; userId: string; gen_id: string;
}) {
  const res = await fetch(`https://cloudy.avi-kay2019.workers.dev/create`, {
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
  const res = await fetch(`https://cloudy.avi-kay2019.workers.dev/update`, {
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
  const res = await fetch(`https://cloudy.avi-kay2019.workers.dev/upload`, { method: 'POST', body: formData });
  return res.json();
}

export async function uploadTraining(params: { file: File; prefix: string }) {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('prefix', params.prefix);
  const res = await fetch(`https://cloudy.avi-kay2019.workers.dev/training/upload`, { method: 'POST', body: formData });
  return res.json();
}

export function getTrainingUrl(key: string) {
  return `https://cloudy.avi-kay2019.workers.dev/training/download/${key}`;
}

export async function listTraining(prefix: string) {
  const res = await fetch(`https://cloudy.avi-kay2019.workers.dev/training/list?prefix=${prefix}/`);
  return res.json();
}
