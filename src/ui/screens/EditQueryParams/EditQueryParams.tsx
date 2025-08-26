import React, { useEffect, useState } from 'react';
import { Box, Newline, Text } from "ink";
import { useNavigate, useParams } from '../../uiLibs/routing';
import * as telejson from 'telejson';
import TextInput from 'ink-text-input';
import { useShortcuts } from '../../uiLibs/shortcuts';

type Props = {
   isFocused: boolean;
   maxHeight: number;
}

export function EditQueryParams({ isFocused, maxHeight }: Props) {
   const navigate = useNavigate();
   const { setShortcuts } = useShortcuts();

   const { functionParams: initialfunctionParams, functionName, modulePath } = useExtractQueryDetailsParams();
   const [functionParams, setFunctionParams] = useState<string>(telejson.stringify(initialfunctionParams));

   useEffect(() => {
      setShortcuts(
         [{
            input: 'return',
            type: 'k',
            label: 'Enter',
            desc: 'Submit params',
         }],
         isFocused
      )
   }, [isFocused]);

   const onSubmit = () => {
      navigate(
         `/module/${
            encodeURIComponent(modulePath)
         }/query/${
            encodeURIComponent(functionName)
         }/withParams/${
            encodeURIComponent(functionParams)
         }`
      )
   }

   return <Box flexDirection='column'>
      <Text bold underline>Edit Params for {functionName}:</Text>
      <Newline />
      <Box flexWrap='wrap'>
         <TextInput value={functionParams} onChange={setFunctionParams} onSubmit={onSubmit} showCursor focus={isFocused} />
      </Box>
   </Box>
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