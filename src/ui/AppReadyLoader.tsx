import React, { useEffect, useState } from "react";
import type { App } from "../app"
import { Box, Text } from "ink";


type Props = {
   app: App;
   children: React.ReactNode;
}

export function AppReadyLoader ({ app, children }: Props) {
   const [appState, setAppState] = useState<'LOADING' | 'READY'>('READY')

   useEffect(() => {
      const onUpdate = ({ type }) => {
         setAppState(type);
      }

      app.subscribeToUpdates(onUpdate);

      return () => app.unsubscribeToUpdates(onUpdate);
   }, [])

   if (appState === 'LOADING') {
      return <Box>
         <Text>
            App is loading ...
         </Text>
      </Box>;
   };

   return <>
      {children}
   </>
}