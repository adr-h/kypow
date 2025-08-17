import React from 'react';
import SelectInput from 'ink-select-input';
import type { Module } from './types';

type Props = {
   displayLimit: number;
   isFocused: boolean;
   modules: Module[];
   onSelect: (module: Module) => void;
}
export function ModuleSelector({ modules, displayLimit, isFocused, onSelect }: Props) {
   const items = modules.map(({ modulePath, queries }) => ({
      label: modulePath,
      key: modulePath,
      value: {modulePath, queries}
   }));

   return (
      <SelectInput
         items={items}
         onSelect={(item) => onSelect(item.value)}
         limit={displayLimit}
         isFocused={isFocused}
      >
      </SelectInput>
   );
}