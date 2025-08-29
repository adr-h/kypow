import React from 'react';
import SelectInput from 'ink-select-input';

type Props = {
   displayLimit: number;
   isFocused: boolean;
   modules: string[];
   onSelect: (module: string) => void;
}
export function ModuleSelector({ modules, displayLimit, isFocused, onSelect }: Props) {
   const items = modules.map(modulePath => ({
      label: modulePath,
      key: modulePath,
      value: modulePath
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