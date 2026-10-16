import { useCallback, useEffect, useRef, useState } from 'react';

const CASE_PREVIEW_MS = 360;
const CASE_RESULT_MS = 160;

export function useValidationPlayback(onComplete) {
  const [playback, setPlayback] = useState(null);
  const run = useRef({ token: 0, timer: null, finish: null });

  const stopTimers = useCallback(() => {
    run.current.token += 1;
    window.clearTimeout(run.current.timer);
    run.current.finish = null;
  }, []);
  useEffect(() => stopTimers, [stopTimers]);

  const cancel = useCallback(() => {
    stopTimers();
    setPlayback(null);
  }, [stopTimers]);

  const start = useCallback(
    (result, instant = false) => {
      stopTimers();
      const token = run.current.token;
      const finish = () => {
        if (run.current.token !== token) return;
        stopTimers();
        setPlayback({
          result,
          running: false,
          currentIndex: null,
          revealedCount: result.cases.length,
        });
        onComplete(result);
      };
      run.current.finish = finish;
      if (instant || !result.cases.length) {
        finish();
        return;
      }
      const preview = (index) => {
        if (run.current.token !== token) return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
          finish();
          return;
        }
        setPlayback({ result, running: true, currentIndex: index, revealedCount: index });
        run.current.timer = window.setTimeout(() => {
          if (run.current.token !== token) return;
          setPlayback({
            result,
            running: true,
            currentIndex: index,
            revealedCount: index + 1,
          });
          run.current.timer = window.setTimeout(() => {
            if (index + 1 < result.cases.length) preview(index + 1);
            else finish();
          }, CASE_RESULT_MS);
        }, CASE_PREVIEW_MS);
      };
      preview(0);
    },
    [onComplete, stopTimers],
  );

  const finish = useCallback(() => run.current.finish?.(), []);
  return { playback, start, cancel, finish };
}
