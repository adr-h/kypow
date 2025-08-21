import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { ModuleSelector } from './ModuleSelector';
import type { Module } from './types';
import { type LoadingState } from '../../uiLibs';
import { QuerySelector } from './QuerySelector';
import { useNavigate } from '../../uiLibs/routing';

type Props = {
   height: number;
   isFocused: boolean;
   setTips: (arg: { key: string, desc: string }[]) => void;
   listQueryModules: () => Promise<{ modules: Module[] }>;
}

export function QueryModulesList({ height, isFocused, listQueryModules, setTips }: Props) {
   const navigate = useNavigate();
   const [loading, setLoading] = useState<LoadingState<Module[]>>({ state: 'LOADING_IN_PROGRESS' });
   const [selectedModule, setSelectedModule] = useState<Module>();
   const [initialIndex, setInitialIndex] = useState<number>(0);

   // eww. manually giving the select input list a number significantly lower than the height to accoutn for padding
   const safeListNumber = height - 4;

   useEffect(() => {
      if (loading.state === 'LOADING_IN_PROGRESS') {
         listQueryModules()
         .then((result) => {
            setLoading({
               state: 'LOADING_SUCCESS',
               result: result.modules
            });
         })
         .catch((err) => {
            setLoading({
               state:'LOADING_ERROR',
               message: err.message
            })
         });
      }
   }, [loading.state])

   if (loading.state === 'LOADING_IN_PROGRESS') {
      return <Text>Scanning modules with queries ...</Text>
   }

   if (loading.state === 'LOADING_ERROR' ) {
      return <Box flexDirection='column'>
         <Text>Scanning failed!</Text>
         <Text>{loading.message}</Text>
      </Box>
   }

   if (selectedModule) {
      const deselectModule = () => setSelectedModule(undefined);

      return (
         <Box flexGrow={1} flexDirection='column'>
            <Text>{selectedModule.modulePath}:</Text>
            <QuerySelector
               isFocused={true}
               displayLimit={safeListNumber}
               module={selectedModule}
               setTips={setTips}
               onBack={deselectModule}
               onSelect={({modulePath, query}) => {
                  navigate(`/module/${encodeURIComponent(modulePath)}/query/${encodeURIComponent(query)}`)
               }}
            />
         </Box>
      );
   }

   const onModuleSelected = (mod: Module) => {
      const index = loading.result.findIndex(({modulePath}) => modulePath === mod.modulePath);
      setInitialIndex(index);
      setSelectedModule(mod);
   }

   const exitApp = () => process.exit(0);

   return (
      <Box flexGrow={1} flexDirection='column'>
         <Text>Query modules ({loading.result.length}): </Text>
         <ModuleSelector
            displayLimit={safeListNumber}
            isFocused={isFocused}
            modules={loading.result}
            initialIndex={initialIndex}
            setTips={setTips}
            onSelect={onModuleSelected}
            onBack={exitApp}
         />
      </Box>
   );
}