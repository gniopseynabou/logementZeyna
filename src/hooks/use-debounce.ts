import { useEffect, useState } from "react";

/**
 * Hook pour différer la mise à jour d'une valeur (ex: recherche texte).
 * @param value La valeur à différer
 * @param delay Le délai en millisecondes
 * @returns La valeur différée
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Met à jour la valeur debouncée après le délai
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Annule le timeout si la valeur ou le délai changent, ou si le composant est démonté
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
