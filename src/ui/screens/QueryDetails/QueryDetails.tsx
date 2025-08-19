import React, { useEffect, useState } from 'react';
import { Box, Text } from "ink";
import type { QueryMeta } from './types';
import type { LoadingState } from '../../uiLibs';
import { useParams } from '../../uiLibs/routing';

type Props = {
   getQuery: (arg: { modulePath: string; functionName: string; }) => Promise<QueryMeta>
}

export function QueryDetails({ getQuery }: Props) {
   const [loading, setLoading] = useState<LoadingState<QueryMeta>>({ state: 'LOADING_IN_PROGRESS' });
   const { functionName, modulePath } = useExtractQueryDetailsParams();

   useEffect(() => {
      if (loading.state === 'LOADING_IN_PROGRESS') {
         getQuery({ functionName, modulePath })
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
            <Text> Loading query ... </Text>
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
      <Box flexDirection='column'>
         <Text>Function: {functionName}</Text>
         <Text>Module Path: {modulePath}</Text>

         <Text>Description:</Text>
         <Text>{result.description}</Text>

         <Text>SQL:</Text>
         <Text>{result.sql}</Text>
      </Box>
   )
}

function useExtractQueryDetailsParams() {
   const params = useParams();

   const encodedModulePath = params.encodedModulePath;
   if (!encodedModulePath) {
      throw new Error(`Missing module path!`);
   }

   const encodedFunctionName = params.encodedFunctionName;
   if (!encodedFunctionName) {
      throw new Error(`Missing function name!`);
   }

   const modulePath = decodeURIComponent(encodedModulePath);
   const functionName = decodeURIComponent(encodedFunctionName);

   return {
      functionName, modulePath
   }
}
