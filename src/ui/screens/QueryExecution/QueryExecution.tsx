import React, { useCallback, useEffect, useState } from 'react';
import { Box, Newline, Text } from "ink";
import type { LoadingState } from '../../uiLibs';
import { useNavigate, useParams } from '../../uiLibs/routing';
import * as telejson from 'telejson';
import wrap from 'word-wrap';
import { ScrollArea } from '../../components/ScrollArea';
import { useShortcuts } from '../../uiLibs/shortcuts/shortcut';

type Result = {
   result: any;
}

type Props = {
   isFocused: boolean;
   maxHeight: number;
   executeQuery: (arg: { modulePath: string; functionName: string; functionParams?: any[] }) => Promise<Result>
}

export function QueryExecution({ executeQuery, maxHeight, isFocused }: Props) {
   const navigateTo = useNavigate();
   const { setShortcuts } = useShortcuts();

   const { functionName, functionParams, modulePath } = useExtractQueryExecutionParams();
   const [loading, setLoading] = useState<LoadingState<Result>>({ state: 'LOADING_IN_PROGRESS' });

   const editParams = useCallback(() => navigateTo(
      `/module/${encodeURIComponent(modulePath)}/query/${encodeURIComponent(functionName)}/editParams/${encodeURIComponent(telejson.stringify(functionParams))}`
   ), [loading]);

   useEffect(() => {
      setShortcuts([
         {
            input: "p",
            type: 'i',
            desc: 'Edit Params',
            handler: editParams
         },
         {
            input: "↑↓",
            type: 'i',
            desc: 'Scroll content'
         }
      ], isFocused);
   }, [isFocused, editParams])


   useEffect(() => {
      if (loading.state === 'LOADING_IN_PROGRESS') {
         executeQuery({ functionName, functionParams, modulePath })
         .then(({result}) => setLoading({ state: 'LOADING_SUCCESS', result }))
         .catch((err) => setLoading({ state:'LOADING_ERROR', message: err.message }));
      }
   }, [loading.state])

   if (loading.state === 'LOADING_IN_PROGRESS') {
      return (
         <Box flexDirection='column'>
            <Text> Loading execution result ... </Text>
         </Box>
      )
   }

   if (loading.state === 'LOADING_ERROR' ) {
      return <Box flexDirection='column'>
         <Text>Loading failed!</Text>
         <Text>{loading.message}</Text>
      </Box>
   }

   const result = loading.result;

   return (
      <ScrollArea height={maxHeight - 8} isFocused={isFocused}>
         <Text>
            <Text bold underline>Execution Results</Text>
            <Newline />
            <Text bold>Function :</Text> <Text>{functionName}()</Text>
            <Newline />
            <Text bold>Module   : </Text><Text>{modulePath}</Text>
            <Newline /> <Newline />

            <Text bold>Params used :</Text>
            <Newline />
            <Text>{telejson.stringify(functionParams, { space: 2 })}</Text>
            <Newline /> <Newline />

            <Text bold>Result      :</Text>
            <Newline />
            <Text>{telejson.stringify(result, { space: 2 })}</Text>
         </Text>
      </ScrollArea>
   )
}

function useExtractQueryExecutionParams() {
   const params = useParams();

   const encodedModulePath = params.encodedModulePath;
   if (!encodedModulePath) {
      throw new Error(`Missing module path!`);
   }

   const encodedFunctionName = params.encodedFunctionName;
   if (!encodedFunctionName) {
      throw new Error(`Missing function name!`);
   }

   const encodedParams = params.encodedJsonFunctionParams;

   const modulePath = decodeURIComponent(encodedModulePath);
   const functionName = decodeURIComponent(encodedFunctionName);
   const functionParams = encodedParams ? telejson.parse(decodeURIComponent(encodedParams)) : undefined;

   return {
      functionName,
      functionParams,
      modulePath,
   }
}
