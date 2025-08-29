import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { ModuleSelector } from './ModuleSelector';
import { useDebouncedState, type LoadingState, ComboBox } from '../../uiLibs';
import { useNavigate } from '../../uiLibs/routing';
import { useShortcuts } from '../../uiLibs/shortcuts/shortcut';

type Props = {
   maxHeight: number;
   isFocused: boolean;
   switchFocusToContent: () => void;
   searchModules: (p: { searchInput: string }) => Promise<{ modules: string[] }>;
}

export function ModuleSearch({ maxHeight, isFocused, searchModules, switchFocusToContent }: Props) {
   const navigate = useNavigate();
   const { setShortcuts } = useShortcuts();

   const [loading, setLoading] = useState<LoadingState<string[]>>({ state: 'LOADING_IN_PROGRESS' });
   const [searchInput, setSearchInput] = useDebouncedState<string>('query', 300);
   const safeListNumber = maxHeight - 5;

   useEffect(() => {
      if (loading.state === 'LOADING_IN_PROGRESS') {
         searchModules({ searchInput })
            .then((result) => {
               setLoading({
                  state: 'LOADING_SUCCESS',
                  result: result.modules
               });
            })
            .catch((err) => {
               setLoading({
                  state: 'LOADING_ERROR',
                  message: err.message
               })
            });
      }
   }, [loading.state])

   useEffect(() => {
      setLoading({
         state: 'LOADING_IN_PROGRESS',
      });
   }, [searchInput])

   useEffect(() => {
      setShortcuts(
         [{
            input: 'return',
            type: 'k',
            label: 'Enter',
            desc: 'Select module',
         },
         {
            input: "↑↓",
            type: 'i',
            desc: 'Scroll results'
         }
         ],
         isFocused
      )
   }, [isFocused]);

   const onModuleSelected = (mod: string) => {
      navigate(`/module/${encodeURIComponent(mod)}/details`);
      switchFocusToContent();
   }

   return (
      <Box flexGrow={1} flexDirection='column'>
         <Text underline>Search Project</Text>
         <ComboBox
            items={loading.state === 'LOADING_SUCCESS' ? loading.result : []}
            onSelect={onModuleSelected}
            initialQuery={searchInput}
            onQueryChange={setSearchInput}
            renderItem={
               ({ item, highlighted, index }) => <Text inverse={highlighted} key={index}> {item} </Text>
            }
            maxHeight={safeListNumber}
            focus={isFocused}
         />

         {
            (loading.state === 'LOADING_IN_PROGRESS') && <Text>Searching modules ...</Text>
         }
         {
            loading.state === 'LOADING_ERROR' && <>
               <Text>Search failed!</Text>
               <Text>{loading.message}</Text>
            </>
         }
      </Box>
   )
}