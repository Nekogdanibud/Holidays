// src/hooks/useCaptureLimits.js
import { useState, useEffect } from 'react';

export default function useCaptureLimits(vacationId) {
  const [limits, setLimits] = useState(null);

  useEffect(() => {
    if (!vacationId) return;
    fetch(`/api/vacations/${vacationId}/capture-limits`, { credentials: 'include' })
      .then(r => r.json())
      .then(setLimits)
      .catch(() => setLimits({ daily: { used: 0, total: 3 }, activities: [] }));
  }, [vacationId]);

  return limits;
}
