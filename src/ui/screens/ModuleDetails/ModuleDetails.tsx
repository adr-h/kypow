import React, { useEffect, useState } from 'react';
import SelectInput from "ink-select-input";
import { Box, Text } from 'ink';
import { useNavigate, useParams } from '../../uiLibs/routing';
import type { LoadingState } from '../../uiLibs';
import { useShortcuts } from '../../uiLibs/shortcuts/shortcut';
import { ThisIsFine } from '../../components/ThisIsFine';

type Props = {
   isFocused: boolean;
   maxHeight: number;
   listQueries:(a: {modulePath: string}) => Promise<string[]>
}
export function ModuleDetails({ maxHeight, isFocused, listQueries }: Props) {
   const navigate = useNavigate();
   const { setShortcuts } = useShortcuts();
   const { modulePath } = useModuleDetailsParams();
   const [loading, setLoading] = useState<LoadingState<string[]>>({ state: 'LOADING_IN_PROGRESS' });

   useEffect(() => {
      setShortcuts(
         [{
            input: 'return',
            type: 'k',
            label: 'Enter',
            desc: 'Select query',
         }],
         isFocused
      )
   }, [isFocused]);

   useEffect(() => {
      if (loading.state === 'LOADING_IN_PROGRESS') {
         listQueries({ modulePath })
         .then((result) => {
            setLoading({ state: 'LOADING_SUCCESS', result });
         })
         .catch((err) => {
            setLoading({ state:'LOADING_ERROR', message: err.message })
         });
      }
   }, [loading.state])

   if (loading.state === 'LOADING_IN_PROGRESS') {
      return (
         <Box flexDirection='column'>
            <Text>Loading module ... </Text>
            <Text>Note: The first module you load might be slow. This is normal. Subsequent loads will be much quicker. </Text>
            <ThisIsFine />
         </Box>
      )
   }

   if (loading.state === 'LOADING_ERROR' ) {
      return <Box flexDirection='column'>
         <Text>Loading failed!</Text>
         <Text>{loading.message}</Text>
      </Box>
   }

   const items = loading.result.map((query) => ({
      key: query,
      label: `${query}()`,
      value: query
   }));


   const navigateToQuery = (query: string) => {
      navigate(`/module/${encodeURIComponent(modulePath)}/query/${encodeURIComponent(query)}`)
   }

   const hasNoQueries = items.length === 0;
   if (hasNoQueries) {
      return <Box flexDirection='column'>
         <Text>No queries found in `{modulePath}.`</Text>
      </Box>
   }

   const hasOnlyOneQuery = items.length === 1;
   if (hasOnlyOneQuery) {
      navigateToQuery(items[0].value);
      return null;
   }

   return <Box flexDirection='column'>
      <Text>Queries in `{modulePath}`:</Text>
      <SelectInput
         items={items}
         onSelect={(item) => navigateToQuery(item.value)}
         limit={maxHeight - 4}
         isFocused={isFocused}
      >
      </SelectInput>
   </Box>
}


function useModuleDetailsParams() {
   const params = useParams();

   const encodedModulePath = params.encodedModulePath;
   if (!encodedModulePath) {
      throw new Error(`Missing module path!`);
   }
   const modulePath = decodeURIComponent(encodedModulePath);

   return {
      modulePath,
   }
}
