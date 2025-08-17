import React from "react";
import { Box } from "ink";

type Props = {
   isFocused: boolean;
}

export function ContentArea({isFocused, children}: React.PropsWithChildren<Props>) {
   return (
      <Box
         flexDirection="column"
         flexGrow={1}
         paddingX={2}
         borderStyle="round"
         borderColor={isFocused ? "green" : "white"}
      >
         {children}
      </Box>
   );
}