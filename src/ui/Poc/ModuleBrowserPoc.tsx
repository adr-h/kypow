// wip Poc to try to list "query modules" using the Typescript AST instead of grepping for a JSDoc tag
// code will be a mess. will clean up later
import React, { useEffect, useState } from 'react';
import {Text, Box, Spacer, Newline, useInput} from 'ink'
import SelectInput from 'ink-select-input';
import type { ScreenSelection } from './ScreenSelection';

type ListModulesResult = Record<string, string[]>;

type ModuleBrowserPocProps = {
   listQueryModules: () => Promise<{ modules: Record<string, string[]> }>;
   changeScreen: (s: ScreenSelection) => void;
   initialModule?: string;
}

type ModuleOption = {
   moduleFile: string, queryFunctions: string[]
}

export function ModuleBrowserPoc (props: ModuleBrowserPocProps) {
   const { initialModule } = props;

   const [ modules, setModules ] = useState<ListModulesResult>({});
   const [ selectedModule, setSelectedModule ] = useState<ModuleOption>();
   const [ hasCompletedInitialLoad, setHasCompletedInitialLoad ] = useState<boolean>(false);

   useInput((input, key) => {
		if (key.escape) {
         if (selectedModule) {
            setSelectedModule(undefined);
         } else {
            process.exit(0);
         }
		}
	});

   useEffect(() => {
      props.listQueryModules()
      .then(({ modules }) => {
         setModules(modules);
         if (!hasCompletedInitialLoad) setHasCompletedInitialLoad(true);
      });
   }, [])

   if (!modules) {
      return <Text>Modules still loading ...</Text>
   }

   if (selectedModule) {
      return <SelectedModule
         option={selectedModule}
         onSelect={(functionName) => {
            props.changeScreen({
               screen: 'QueryDetails',
               props: {
                  modulePath: selectedModule.moduleFile,
                  functionName
               }
            });
         }}
      />
   }

   const items = Object.entries(modules)
                  .map(
                     ([moduleFile, queryFunctions]) => ({
                        label: moduleFile,
                        key: moduleFile,
                        value: {
                           moduleFile,
                           queryFunctions
                        } satisfies ModuleOption
                     })
                  );

	return <>
      <Text>
         <Text>Modules with Queries:</Text>
      </Text>

      <Box>
         <SelectInput
            items={items}
            onSelect={(item) => setSelectedModule(item.value)}
         />
      </Box>

      <Text>[ESC] Exit app </Text>
   </>;
}

type SelectedModuleProps = {
   option: ModuleOption,
   onSelect: (s: string) => void,
}
function SelectedModule({ option, onSelect }: SelectedModuleProps) {
   const items = option.queryFunctions.map(funcName => ({
      label: `${funcName}()`,
      value: funcName
   }));

   return <>
      <Text>Queries in `${option.moduleFile}`</Text>

      <Box>
         <SelectInput
            items={items}
            onSelect={(option) => onSelect(option.value)}
         />
      </Box>

      <Text>[ESC] Back to module browser </Text>
   </>
}