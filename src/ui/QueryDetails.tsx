import React, { useEffect, useState } from 'react';
import {Text, Box, Newline, Static} from 'ink'
import type { ScreenSelection } from './ScreenSelection';
// import Markdown from 'ink-markdown';
import dedent from 'dedent';
import {useInput} from 'ink';

type QueryMeta = {
   name: string,
   description: string,
   params: any[],
   sql: string,
   sampleSql: string,
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
   const [ queryMeta, setQueryMeta ] = useState<QueryMeta>();
   const [ lastFetch, setLastFetch ] = useState<Date>(new Date());

	useInput((input, key) => {
		if (input === 'r') {
         setLastFetch(new Date());
		}

		if (key.escape) {
         props.changeScreen({
            screen: 'ModuleDetails',
            props: {
               modulePath: props.modulePath
            }
         });
		}
	});


   useEffect(() => {
      props.getQuery({ modulePath: props.modulePath, functionName: props.functionName })
         .then((query) => {
            setQueryMeta(query);
         })
         .catch(err => {
            console.error(err);
         });
   }, [lastFetch])

   if (!queryMeta) {
      return <Box>
         <Text>Query still loading.... ...</Text>
      </Box>
   }

   const text = dedent
`
# ${queryMeta.name}

## Docs
${queryMeta.description}

## SQL
- Parametized SQL:
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
   </>;
}
