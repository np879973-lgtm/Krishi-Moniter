// Offline Drafts Hook for Krishi Mentor (Part 8)
import { useState, useEffect, useCallback } from 'react';
import { OfflineDraft } from '../types';
import {
  getAllDrafts,
  saveDraft,
  deleteDraft,
} from '../storage/repositories/draftRepository';

export function useOfflineDrafts() {
  const [drafts, setDrafts] = useState<OfflineDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDrafts = useCallback(async () => {
    try {
      const items = await getAllDrafts();
      setDrafts(items);
    } catch (err) {
      console.error('Failed to load offline drafts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const handleSaveDraft = async (draft: OfflineDraft) => {
    await saveDraft(draft);
    await loadDrafts();
  };

  const handleDeleteDraft = async (draftId: string) => {
    await deleteDraft(draftId);
    await loadDrafts();
  };

  return {
    drafts,
    isLoading,
    saveDraft: handleSaveDraft,
    deleteDraft: handleDeleteDraft,
    reloadDrafts: loadDrafts,
  };
}
