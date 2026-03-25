import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const HEADER_OFFSET_PX = 72;
const MAX_ATTEMPTS = 20;
const ATTEMPT_DELAY_MS = 50;

export default function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash || location.hash.length < 2) return;

    const targetId = decodeURIComponent(location.hash.slice(1));
    if (!targetId) return;

    let cancelled = false;
    let timeoutId: number | undefined;

    const scrollToTarget = (attempt = 0) => {
      if (cancelled) return;

      const element = document.getElementById(targetId);
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET_PX;
        window.scrollTo({ top: y, behavior: 'smooth' });
        return;
      }

      if (attempt < MAX_ATTEMPTS) {
        timeoutId = window.setTimeout(() => scrollToTarget(attempt + 1), ATTEMPT_DELAY_MS);
      }
    };

    requestAnimationFrame(() => scrollToTarget());

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [location.key, location.hash]);

  return null;
}

