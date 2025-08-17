import React from 'react';
import { Box, Text, useInput } from "ink";

type Props = {
   isFocused: boolean;
}

export function Sidebar({ isFocused, children }: React.PropsWithChildren<Props>) {
   return (
      <Box
         flexDirection="column"
         paddingX={1}
         borderStyle="round"
         borderColor={isFocused ? "green" : "white"}
      >
         {children}
      </Box>
   );
};