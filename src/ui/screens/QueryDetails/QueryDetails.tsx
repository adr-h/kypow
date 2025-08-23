import React, { useEffect, useState } from 'react';
import { Box, Newline, Text, useInput } from "ink";
import type { QueryMeta } from './types';
import type { LoadingState } from '../../uiLibs';
import { useNavigate, useParams } from '../../uiLibs/routing';
import * as telejson from 'telejson';
import wrap from 'word-wrap';
import clipboard from 'clipboardy';
import { ScrollArea } from '../../components/ScrollArea';

type Props = {
   isFocused: boolean;
   maxHeight: number;
   setTips: (arg: { key: string, desc: string }[]) => void;
   getQuery: (arg: { modulePath: string; functionName: string; functionParams?: any[] }) => Promise<QueryMeta>
}

export function QueryDetails({ getQuery, setTips, maxHeight, isFocused }: Props) {
   const navigateTo = useNavigate();
   const [loading, setLoading] = useState<LoadingState<QueryMeta>>({ state: 'LOADING_IN_PROGRESS' });
   const { functionName, functionParams, modulePath } = useExtractQueryDetailsParams();
   const [sqlMode, setSqlMode] = useState<'sql' | 'interpolatedSql'>( functionParams ? 'interpolatedSql' : 'sql');

   useInput((input, key) => {
      if (!isFocused) return;
      if (!(loading.state === 'LOADING_SUCCESS')) return;

      if (input.toLowerCase() === 'c') return clipboard.writeSync(loading.result[sqlMode])

      if (input.toLowerCase() === 's') return setSqlMode(sqlMode === 'sql' ? 'interpolatedSql' : 'sql');

      if (input.toLowerCase() === 'p')
         return navigateTo(
            `/module/${
               encodeURIComponent(modulePath)
            }/query/${
               encodeURIComponent(functionName)
            }/editParams/${
               encodeURIComponent(telejson.stringify(loading.result.paramsUsed))
            }`
         )
   })

   useEffect(() => {
      if (!isFocused) return;

      setTips([
         { key: "c", desc: "Copy SQL" },
         { key: "s", desc: "Switch SQL" },
         { key: "p", desc: 'Edit Params'},
         { key: "↑↓", desc: 'Scroll content'}
      ])
   }, [isFocused])

   useEffect(() => {
      if (loading.state === 'LOADING_IN_PROGRESS') {
         getQuery({ functionName, functionParams, modulePath })
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
   const sql = result[sqlMode];
   const description = result.description;

   return (
      <ScrollArea height={maxHeight - 8} isFocused={isFocused}>
         <Text>
            <Text bold>Function :</Text> <Text>{functionName}()</Text>
            <Newline />
            <Text bold>Module   : </Text><Text>{modulePath}</Text>
            <Newline /> <Newline />

            <Text bold>SQL      :</Text>
            <Newline />
            <Text>{wrap(sql, { width: 50 })}</Text>
            <Newline /> <Newline />

            <Text bold>Docs     :</Text>
            <Newline />
            <Text>{description}</Text>
         </Text>
      </ScrollArea>
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
