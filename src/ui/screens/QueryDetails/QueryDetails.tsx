import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Newline, Text, useInput } from "ink";
import type { QueryMeta } from './types';
import type { LoadingState } from '../../uiLibs';
import { useNavigate, useParams } from '../../uiLibs/routing';
import * as telejson from 'telejson';
import wrap from 'word-wrap';
import clipboard from 'clipboardy';
import { ScrollArea } from '../../components/ScrollArea';
import { useShortcuts } from '../../uiLibs/shortcuts/shortcut';

type Props = {
   isFocused: boolean;
   maxHeight: number;
   getQuery: (arg: { modulePath: string; functionName: string; functionParams?: any[] }) => Promise<QueryMeta>
}

export function QueryDetails({ getQuery, maxHeight, isFocused }: Props) {
   const navigateTo = useNavigate();
   const { setShortcuts } = useShortcuts();

   const { functionName, functionParams, modulePath } = useExtractQueryDetailsParams();
   const [loading, setLoading] = useState<LoadingState<QueryMeta>>({ state: 'LOADING_IN_PROGRESS' });
   const [sqlMode, setSqlMode] = useState<'sql' | 'interpolatedSql'>( functionParams ? 'interpolatedSql' : 'sql');

   const copySqlToClipboard = useCallback(() => loading.state === 'LOADING_SUCCESS' && clipboard.writeSync(loading.result[sqlMode]), [loading, sqlMode]);
   const toggleSqlMode = useCallback(() => setSqlMode(sqlMode === 'sql' ? 'interpolatedSql' : 'sql'), [sqlMode]);
   const editParams = useCallback(() => loading.state === 'LOADING_SUCCESS' && navigateTo(
      `/module/${encodeURIComponent(modulePath)}/query/${encodeURIComponent(functionName)}/editParams/${encodeURIComponent(telejson.stringify(loading.result.paramsUsed))}`
   ), [loading]);
   const executeQuery = useCallback(() => loading.state === 'LOADING_SUCCESS' && navigateTo(
      `/module/${encodeURIComponent(modulePath)}/query/${encodeURIComponent(functionName)}/execute/${encodeURIComponent(telejson.stringify(loading.result.paramsUsed))}`
   ), [loading]);

   useEffect(() => {
      setShortcuts([
         {
            input: 's',
            type: 'i',
            desc: 'Switch SQL',
            handler: toggleSqlMode
         },
         {
            input: 'c',
            type: 'i',
            desc: 'Copy SQL',
            handler: copySqlToClipboard
         },
         {
            input: "p",
            type: 'i',
            desc: 'Edit Params',
            handler: editParams
         },
         {
            input: 'x',
            type: 'i',
            desc: 'Exec query',
            handler: executeQuery,
         },
         {
            input: "↑↓",
            type: 'i',
            desc: 'Scroll'
         }
      ], isFocused);
   }, [isFocused, toggleSqlMode, copySqlToClipboard, editParams, executeQuery])


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
            <Text bold underline>Query Details</Text>
            <Newline />

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
