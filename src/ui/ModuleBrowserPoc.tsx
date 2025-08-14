// wip Poc to try to list "query modules" using the Typescript AST instead of grepping for a JSDoc tag
// code will be a mess. will clean up later
import React, { useEffect, useState } from 'react';
import {Text, Box, Spacer, Newline, useInput} from 'ink'
import SelectInput from 'ink-select-input';
import type { ScreenSelection } from './ScreenSelection';

type ModuleBrowserPocProps = {
   listQueryModules: () => Promise<{ modules: Record<string, string[]> }>;
   changeScreen: (s: ScreenSelection) => void;
}

export function ModuleBrowserPoc (props: ModuleBrowserPocProps) {
   const [ modules, setModules ] = useState<Record<string, string[]>>({});

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

   const handleSelect = (item: {label: string, value: { moduleFile: string, query: string } }) => {
      props.changeScreen({
         screen: 'QueryDetails',
         props: {
            modulePath: item.value.moduleFile,
            functionName: item.value.query
         }
      });
	};

   const items = Object.entries(modules)
                  .map(
                     ([moduleFile, queryFunctions]) => queryFunctions.map(query => ({ query, moduleFile }))
                  )
                  .flat()
                  .map(({ query, moduleFile }) => ({
                     label: `${query}: (${moduleFile})`,
                     key:`${moduleFile}: ${query}`,
                     value: {
                        moduleFile,
                        query
                     }
                  }))


	return <>
      <Text>
         <Text>Queries:</Text>
      </Text>

      <Box>
         <SelectInput items={items} onSelect={handleSelect} />
      </Box>

      <Text> [ESC] Exit app </Text>
   </>;
}
