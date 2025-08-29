import { useEffect, useState } from "react";


export function useDebouncedState<T> (initialState: T, timeoutMs = 200) {
   const [actualState, setActualState] = useState<T>(initialState);
   const [debounceState, setDebounceState] = useState<T>(initialState);

   useEffect(() => {
      if (debounceState === actualState) return;

      const callback = () => setActualState(debounceState);
      const timeout = setTimeout(callback, timeoutMs);
      return () => clearTimeout(timeout)
   }, [debounceState])


   return [actualState, setDebounceState] as const;
}