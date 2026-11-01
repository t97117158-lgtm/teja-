import { useState, useCallback } from 'react';

export function useSmartBlur(initialActive: boolean = true) {
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [isGlobalBlurActive, setIsGlobalBlurActive] = useState<boolean>(initialActive);

  const startReveal = useCallback((id: string) => {
    if (!isGlobalBlurActive) return;
    setRevealedIds(prev => ({ ...prev, [id]: true }));
  }, [isGlobalBlurActive]);

  const endReveal = useCallback((id: string) => {
    if (!isGlobalBlurActive) return;
    setRevealedIds(prev => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [isGlobalBlurActive]);

  const toggleGlobalBlur = useCallback(() => {
    setIsGlobalBlurActive(prev => !prev);
    setRevealedIds({});
  }, []);

  const setGlobalBlur = useCallback((active: boolean) => {
    setIsGlobalBlurActive(active);
    if (!active) {
      setRevealedIds({});
    }
  }, []);

  const isBlurred = useCallback((id: string) => {
    if (!isGlobalBlurActive) return false;
    return !revealedIds[id];
  }, [isGlobalBlurActive, revealedIds]);

  return {
    isGlobalBlurActive,
    toggleGlobalBlur,
    setGlobalBlur,
    startReveal,
    endReveal,
    isBlurred,
    revealedIds
  };
}
