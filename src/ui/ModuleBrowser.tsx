import React, { useEffect, useState } from 'react';
import {Text, Box, Spacer, Newline, useInput} from 'ink'
import SelectInput from 'ink-select-input';
import type { ScreenSelection } from './ScreenSelection';
// import { QuickSearch } from 'ink-quicksearch-input';

type ModuleBrowserProps = {
   listQueryModules: () => Promise<{ modules: string[] }>;
   changeScreen: (s: ScreenSelection) => void;
}

export function ModuleBrowser (props: ModuleBrowserProps) {
   const [ modules, setModules ] = useState<string[]>([]);

   useInput((input, key) => {
		if (key.escape) {
         process.exit(0);
		}
	});

   useEffect(() => {
      props.listQueryModules()
         .then(({ modules }) => {
            setModules(modules);
         });
   }, [])

   if (!modules) {
      return <Box>
         <Text>Modules still loading ...</Text>
      </Box>
   }

   const handleSelect = (item: {label: string, value: string}) => {
      props.changeScreen({
         screen: 'ModuleDetails',
         props: {
            modulePath: item.value
         }
      });
	};
   const items = modules.map(mod => ({
      label: mod,
      value: mod
   }));

	return <>
      <Text>
         <Text>Query Modules:</Text>
      </Text>

      <Box>
         <SelectInput items={items} onSelect={handleSelect} />
      </Box>
      {/* <QuickSearch items={items} onSelect={handleSelect} /> */}

      <Text> [ESC] Exit app </Text>
   </>;
}
