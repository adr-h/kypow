import React, { useState, useContext, createContext } from "react"
import { useInput, type Key } from 'ink'

type KeyShortcut = {
   type: 'k';
   input: keyof Key;
   label?: string;
   desc: string;
   handler?: () => void; //handler is not always necessary, since some Ink components "steal focus" and have their own input handling
}

type InputShortcut = {
   type: 'i';
   input: string;
   label?: string;
   desc: string;
   handler?: () => void;
}

type Shortcut = KeyShortcut | InputShortcut;
type ShortcutTip = {
   label: string;
   desc: string;
}

type ShortcutsContextType = {
   enabledShortcuts: Shortcut[];
   enabledTips: ShortcutTip[];
   setShortcuts: (s: Shortcut[], isEnabled: boolean) => void;
}

const ShortcutsContext = createContext<ShortcutsContextType | null>(null)

type ShortcutsProviderProps = {
   children: React.ReactNode;
   globalShortcuts: Shortcut[];
}
export function ShortcutsProvider({ children, globalShortcuts }: ShortcutsProviderProps) {
   const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);

   const enabledShortcuts = globalShortcuts.concat(shortcuts);
   const enabledTips = enabledShortcuts.map(({label,input,desc}) => ({
      label: label || input, desc
   }));

   const setShortcutsIfEnabled = (s: Shortcut[], isEnabled: boolean) => {
      if (isEnabled) {
         setShortcuts(s)
      }
   }

   useInput((input, key) => {
      for (const s of enabledShortcuts) {
         if (!s.handler) return;

         if (s.type === 'i' && input.toLowerCase() === s.input.toLowerCase()) {
            return s.handler();
         }

         if (s.type === 'k' && key[s.input]) {
            return s.handler();
         }
      }
   });

   return (
      <ShortcutsContext.Provider value={{ enabledShortcuts, enabledTips, setShortcuts: setShortcutsIfEnabled }}>
         {children}
      </ShortcutsContext.Provider>
   )
}

export function useShortcuts() {
   const ctx = useContext(ShortcutsContext)
   if (!ctx) throw new Error('useShortcuts must be inside ShortcutsProvider')
   return ctx
}

