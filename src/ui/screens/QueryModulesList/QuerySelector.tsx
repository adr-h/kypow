import React from 'react';
import type { Module } from "./types"
import SelectInput from "ink-select-input";

type Props = {
   module: Module;
   onSelect: (p: { modulePath: string, query: string}) => void;
   displayLimit: number;
   isFocused: boolean;
}
export function QuerySelector({ onSelect, module: selectedModule, displayLimit, isFocused }: Props) {
   const { modulePath, queries } = selectedModule;

   const items = queries.map((query) => ({
      key: query,
      label: `${query}()`,
      value: {
         modulePath,
         query
      }
   }))

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