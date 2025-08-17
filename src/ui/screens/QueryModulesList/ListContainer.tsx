import { Box, Text } from 'ink';
import React from 'react';

type Props = {
   navigationTips: string;
}
export function ListContainer({ children, navigationTips }: React.PropsWithChildren<Props>) {
   return (
      <Box flexDirection='column'>
         <Box flexGrow={1} flexDirection='column'>
            {children}
         </Box>
         <Box>
            <Text>{navigationTips}</Text>
         </Box>
      </Box>
   )
}