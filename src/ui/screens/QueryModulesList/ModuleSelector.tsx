import React, { useEffect } from 'react';
import SelectInput from 'ink-select-input';
import type { Module } from './types';
import { useInput } from 'ink';

type Props = {
   displayLimit: number;
   isFocused: boolean;
   modules: Module[];
   initialIndex?: number;
   onSelect: (module: Module) => void;

   onBack: () => void;
   setTips: (arg: { key: string, desc: string }[]) => void;
}
export function ModuleSelector({ modules, displayLimit, isFocused, onSelect, onBack, setTips, initialIndex = 0 }: Props) {
   const items = modules.map(({ modulePath, queries }) => ({
      label: modulePath,
      key: modulePath,
      value: {modulePath, queries}
   }));

   useInput((_input, key) => {
      if (!isFocused) return;
      if (key.escape) return onBack();
   });

   useEffect(() => {
      if (!isFocused) return;

      setTips([
         { key: 'Esc', desc: 'Exit app' },
         { key: 'Enter', desc: 'Select' }
      ])
   }, [isFocused]);

   return (
      <SelectInput
         items={items}
         initialIndex={initialIndex}
         onSelect={(item) => onSelect(item.value)}
         limit={displayLimit}
         isFocused={isFocused}
      >
      </SelectInput>
   );
}