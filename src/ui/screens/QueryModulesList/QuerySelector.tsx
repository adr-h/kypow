import React, { useEffect } from 'react';
import type { Module } from "./types"
import SelectInput from "ink-select-input";
import { useInput } from 'ink';

type Props = {
   module: Module;
   onSelect: (p: { modulePath: string, query: string}) => void;
   displayLimit: number;
   isFocused: boolean;

   onBack: () => void;
   setTips: (arg: { key: string, desc: string }[]) => void;
}
export function QuerySelector({ onSelect, onBack, module: selectedModule, displayLimit, isFocused, setTips }: Props) {
   const { modulePath, queries } = selectedModule;

   const items = queries.map((query) => ({
      key: query,
      label: `${query}()`,
      value: {
         modulePath,
         query
      }
   }));

   useInput((_input, key) => {
      if (!isFocused) return;
      if (key.escape) return onBack();
   });

   useEffect(() => {
      if (!isFocused) return;

      setTips([
         { key: 'Esc', desc: 'Back' },
         { key: 'Enter', desc: 'Select' }
      ])
   }, [isFocused, selectedModule]);

   return <>
      <SelectInput
         items={items}
         onSelect={(item) => onSelect(item.value)}
         limit={displayLimit}
         isFocused={isFocused}
      >
      </SelectInput>
   </>
}