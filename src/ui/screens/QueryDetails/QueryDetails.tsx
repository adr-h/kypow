import React from 'react';
import { Box, Text } from "ink";
import { useParams } from "wouter";

export function QueryDetails() {
   const { functionName, modulePath } = useExtractQueryDetailsParams();

   return (
      <Box flexDirection='column'>
         <Text>Function: {functionName}</Text>
         <Text>Module Path: {modulePath}</Text>
      </Box>
   )
}

function useExtractQueryDetailsParams() {
   const params = useParams();

   const encodedModulePath = params.encodedModulePath;
   if (!encodedModulePath) {
      throw new Error(`Missing module path!`);
   }

   const encodedQueryFunction = params.encodedQueryFunction;
   if (!encodedQueryFunction) {
      throw new Error(`Missing function!`);
   }

   const modulePath = decodeURIComponent(encodedModulePath);
   const functionName = decodeURIComponent(encodedQueryFunction);

   return {
      functionName, modulePath
   }
}
