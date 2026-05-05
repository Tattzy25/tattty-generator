import { useState, useCallback, useEffect } from 'react';
import { listModels } from '../lib/api';

export interface ModelData {
  id?: string | number;
  model_name?: string;
  artist_name?: string;
  description?: string;
  tags?: string[];
  trigger_word?: string;
  cover_image?: string;
  user_id?: string;
  gen_id?: string;
  version?: string;
  _reactKey?: string;
  [key: string]: any;
}

function parseTagsField(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') return raw.split(',').map((t: string) => t.trim()).filter(Boolean);
  return [];
}

export function useModels() {
  const [models, setModels] = useState<ModelData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadModels = useCallback(async (cancelled = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const { models: items } = await listModels();

      if (!cancelled) {
        const mapped: ModelData[] = items.map((m: any, idx: number) => ({
          ...m,
          id: m.gen_id || m.key || idx,
          model_name: m.modelName,
          artist_name: m.artistName,
          trigger_word: m.triggerWord,
          description: m.description,
          tags: parseTagsField(m.tags),
          cover_image: m.coverImage,
          user_id: m.userId,
          gen_id: m.gen_id,
          version: m.versionId,
          _reactKey: m.gen_id || m.key || String(idx),
        }));
        setModels(mapped);
      }
    } catch (err: any) {
      console.error('Failed to load models:', err);
      if (!cancelled) setError(err);
    } finally {
      if (!cancelled) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadModels(cancelled);

    const interval = setInterval(() => loadModels(cancelled), 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [loadModels]);

  const refetch = () => loadModels(false);

  return { models, refetch, isLoading, error };
}
