import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { ModuleSelector } from './ModuleSelector';
import type { Module } from './types';
import { type LoadingState } from '../../uiLibs';
import { QuerySelector } from './QuerySelector';
import { ListContainer } from './ListContainer';
import { useLocation } from 'wouter';

type Props = {
   height: number;
   isFocused: boolean;
   listQueryModules: () => Promise<{ modules: Module[] }>;
}

export function QueryModulesList({ height, isFocused, listQueryModules }: Props) {
   const [location, navigate] = useLocation();
   const [loading, setLoading] = useState<LoadingState<Module[]>>({ state: 'LOADING_IN_PROGRESS' });
   const [selectedModule, setSelectedModule] = useState<Module>();

   // eww. manually giving the select input list a number significantly lower than the height to accoutn for padding
   const safeListNumber = height - 4;

   useInput((input, key) => {
      if (!isFocused) return;

      if (key.escape) {
         if (selectedModule) return setSelectedModule(undefined);

         return process.exit(0);
      };

   });

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
      return (
         <ListContainer navigationTips={"[ESC] Back | [ENTER] Select"}>
            <Text>{selectedModule.modulePath}:</Text>
            <QuerySelector
               isFocused={true}
               displayLimit={safeListNumber}
               module={selectedModule}
               onSelect={({modulePath, query}) => {
                  // navigate(`/query?modulePath=${modulePath}&query=${query}`)
                  navigate(`/module/${encodeURIComponent(modulePath)}/query/${encodeURIComponent(query)}`)
               }}
            />
         </ListContainer>
      );
   }

   return (
      <ListContainer navigationTips={"[ESC] Exit | [ENTER] Select | [/] ???"}>
         <Text>Query modules:</Text>
         <ModuleSelector
            displayLimit={safeListNumber}
            isFocused={isFocused}
            modules={loading.result}
            onSelect={setSelectedModule}
         />
      </ListContainer>
   );
}