import React from 'react';
import { Box, Text } from 'ink';

export type Tip = {
   label: string;
   desc: string;
}

export function NavigationTips({ tips }: { tips: Tip[] }) {
   return (
      <Box
         flexDirection="row"
         flexGrow={1}
         borderStyle="round"
         borderColor={"yellow"}
      >
         <Text> Navigation - </Text>
         {
            tips.map(({label, desc}) =>
            <Text key={label}>
               [{label}] {desc} |{' '}
            </Text>
         )}
      </Box>
   )
}