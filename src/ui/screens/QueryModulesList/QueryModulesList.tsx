import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { ModuleSelector } from './ModuleSelector';
import type { Module } from './types';
import { type LoadingState } from '../../uiLibs';
import { useNavigate } from '../../uiLibs/routing';

type Props = {
   maxHeight: number;
   isFocused: boolean;
   setTips: (arg: { key: string, desc: string }[]) => void;
   switchFocusToContent: () => void;
   listQueryModules: () => Promise<{ modules: Module[] }>;
}

export function QueryModulesList({ maxHeight, isFocused, listQueryModules, switchFocusToContent, setTips }: Props) {
   const navigate = useNavigate();
   const [loading, setLoading] = useState<LoadingState<Module[]>>({ state: 'LOADING_IN_PROGRESS' });
   const safeListNumber = maxHeight - 4;

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

   useEffect(() => {
      if (!isFocused) return;

      setTips([{ key: 'Enter', desc: 'Select' }])
   }, [isFocused]);

   if (loading.state === 'LOADING_IN_PROGRESS') {
      return <Text>Scanning modules with queries ...</Text>
   }

   if (loading.state === 'LOADING_ERROR' ) {
      return <Box flexDirection='column'>
         <Text>Scanning failed!</Text>
         <Text>{loading.message}</Text>
      </Box>
   }

   const onModuleSelected = (mod: Module) => {
      navigate(`/module/${encodeURIComponent(mod.modulePath)}/details`);
      switchFocusToContent();
   }

   return (
      <Box flexGrow={1} flexDirection='column'>
         <Text>Query modules ({loading.result.length}): </Text>
         <ModuleSelector
            displayLimit={safeListNumber}
            isFocused={isFocused}
            modules={loading.result}
            onSelect={onModuleSelected}
         />
      </Box>
   );
}