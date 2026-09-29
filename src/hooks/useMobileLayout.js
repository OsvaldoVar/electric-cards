import { useSyncExternalStore } from 'react';

const query = '(max-width: 600px)';
const snapshot = () => window.matchMedia(query).matches;
const subscribe = (notify) => {
  const media = window.matchMedia(query);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};

export function useMobileLayout() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
