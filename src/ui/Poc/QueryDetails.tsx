import React, { useEffect, useState } from 'react';
import {Text, Box, Newline, Static} from 'ink'
import type { ScreenSelection } from './ScreenSelection';
// import Markdown from 'ink-markdown';
import dedent from 'dedent';
import {useInput} from 'ink';

type QueryMeta = {
   name: string,
   description: string,
   sql: string,
   // sampleSql: string,
   // sampleParams: any[],
}

type QueryDetailsProps = {
   changeScreen: (s: ScreenSelection) => void;
   modulePath: string;
   functionName: string;
   getQuery: (arg: {
      modulePath: string;
      functionName: string;
   }) => Promise<QueryMeta>
}

export function QueryDetails (props: QueryDetailsProps) {
   const { modulePath, functionName } = props;

   const [ queryMeta, setQueryMeta ] = useState<QueryMeta>();
   const [ lastFetch, setLastFetch ] = useState<Date>(new Date());

	useInput((input, key) => {
		if (input === 'r') {
         setLastFetch(new Date());
		}

		if (key.escape) {
         props.changeScreen({
            screen: 'ModuleBrowser',
            props: {
               initialModule: modulePath
            }
         });
		}
	});

   useEffect(() => {
      props.getQuery({ modulePath, functionName })
         .then((query) => {
            setQueryMeta(query);
         })
         .catch(err => {
            console.error(err);
         });
   }, [lastFetch])

   if (!queryMeta) {
      return <Text>Query still loading ...</Text>;
   }

   const text = dedent
`
# ${queryMeta.name}

## Docs
${queryMeta.description}

## SQL
${queryMeta.sql}
`

// - Sample SQL:
//    \`${queryMeta.sampleSql}\`
	return <>
      <Text>
         <Text>Query Details:</Text>
         <Newline />
      </Text>

      <Box>
         <Text>{text}</Text>
      </Box>

      <Text> [ESC] Back | [R] Reload Query </Text>
   </>;
}
