import React, { useState } from "react";
import { Box, render, Text, useInput } from "ink";
import type { App } from "../app";
import { Sidebar } from "./components/Sidebar";
import { QueryModulesList } from "./screens/QueryModulesList";
import { Home } from "./screens/Home";
import { ContentArea } from "./components/ContentArea";
import { QueryDetails } from "./screens/QueryDetails";
import { Router, Route } from "./uiLibs/routing";
import { NavigationTips } from "./components/NavigationTips";
import type { Tip } from "./components/NavigationTips/NavigationTips";

const height = 15;

type UiAppProps = {
   app: App;
};
function UiApp({ app }: UiAppProps) {
   const [tips, setTips] = useState<Tip[]>([]);
   const [focused, setFocused] = useState<'Sidebar' | 'Content'>('Sidebar');

   const toggleFocused = () => {
      setFocused(
         focused === 'Sidebar' ? 'Content' : 'Sidebar'
      );
   }
   useInput((input, key) => {
      if (key.tab) {
         toggleFocused();
      }
   });

   return (
      <Router>
         <Box flexDirection="column" columnGap={0}>
            <NavigationTips tips={tips} />

            <Box flexDirection="row" height={height}>
               <Sidebar isFocused={focused === 'Sidebar'}>
                  <QueryModulesList
                     height={height}
                     setTips={setTips}
                     isFocused={focused === 'Sidebar'}
                     listQueryModules={app.listQueryModules.bind(app)}
                  />
               </Sidebar>

               <ContentArea isFocused={focused === 'Content'}>
                  <Route path="/">
                     <Home />
                  </Route>
                  <Route path="/module/:encodedModulePath/query/:encodedFunctionName">
                     <QueryDetails
                        setTips={setTips}
                        isFocused={focused === 'Content'}
                        getQuery={app.getQuery.bind(app)}
                     />
                  </Route>
               </ContentArea>
            </Box>
         </Box>

      </Router>
   );
}

export function renderUiApp(app: App) {
   render(<UiApp app={app} />);
}

