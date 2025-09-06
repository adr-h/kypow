import React, { useEffect, useState } from 'react';
import { Box, Newline, Text, useInput } from "ink";
import { useNavigate, useParams } from '../../uiLibs/routing';
import * as telejson from 'telejson';
import { useShortcuts } from '../../uiLibs/shortcuts';
import { TextArea } from '../../components/TextArea';

type Props = {
   isFocused: boolean;
   maxHeight: number;
}

export function EditQueryParams({ isFocused, maxHeight }: Props) {
   const navigate = useNavigate();
   const { setShortcuts } = useShortcuts();

   const { functionParams: initialfunctionParams, functionName, modulePath } = useExtractQueryDetailsParams();
   const [functionParams, setFunctionParams] = useState<string>(telejson.stringify(initialfunctionParams, { space: 2 }));

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

   useEffect(() => {
      setShortcuts([],isFocused)
   }, [isFocused]);

   // todo: shortcuts should be able to support chorded inputs
   useInput((input, key) => {
      if (key.ctrl && input === 'x') {
         onSubmit();
      }
   })

   return <Box flexDirection='column'>
      <Text>
         <Text bold underline>Edit Params for {functionName}:</Text>
         <Newline />
         <Text>Press [ctrl + x] to submit these params</Text>
      </Text>
      <Box flexWrap='wrap' borderStyle='single'>
         <TextArea
            value={functionParams}
            onChange={setFunctionParams}
            visibleHeight={10}
         />
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