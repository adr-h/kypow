import React, { useEffect, useState } from 'react';
import {Text, Box, Spacer, Newline, useInput} from 'ink'
import SelectInput from 'ink-select-input';
import type { ScreenSelection } from './ScreenSelection';

type ModuleDetailProps = {
   modulePath: string;
   listQueries: (arg: { modulePath: string}) => Promise<string[]>
   changeScreen: (s: ScreenSelection) => void;
}

export function ModuleDetails (props: ModuleDetailProps) {
   const [ queries, setQueries ] = useState<string[]>([]);

	useInput((input, key) => {

		if (key.escape) {
         props.changeScreen({
            screen: 'ModuleBrowser',
            props: {}
         });
		}
	});

   useEffect(() => {
      props.listQueries({ modulePath: props.modulePath })
         .then((queries) => {
            setQueries(queries);
         });
   }, [])

   if (!queries) {
      return <Box>
         <Text>Queries still loading ...</Text>
      </Box>
   }

   const handleSelect = (item: {label: string, value: string}) => {
      // setSelectedModule(item.value)
      props.changeScreen({
         screen: 'QueryDetails',
         props: {
            modulePath: props.modulePath,
            functionName: item.value
         }
      })
	};
   const items = queries.map(mod => ({
      label: mod,
      value: mod
   }));

	return <>
      <Text>
         <Text>Queries in ${props.modulePath}:</Text>
      </Text>
      {/* <QuickSearch items={items} onSelect={handleSelect} /> */}

      <Box>
         <SelectInput items={items} onSelect={handleSelect} />
      </Box>

      <Text> [ESC] Back </Text>
   </>;
}
