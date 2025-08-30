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
         gap={0}
      >
         <Text bold> Navigation: </Text>
         {
            tips.map(({label, desc}) =>
               <Text key={label}>
                  [{label}] {desc}{' | '}
               </Text>
            )
         }
      </Box>
   )
}