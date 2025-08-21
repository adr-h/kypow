import React, { useState } from "react";
import { Box, render, Text } from "ink";
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

   return (
      <Router>
         <Box flexDirection="column" columnGap={0}>
            <NavigationTips tips={tips} />

            <Box flexDirection="row" height={height}>
               <Sidebar isFocused={true}>
                  <QueryModulesList
                     height={height}
                     setTips={setTips}
                     isFocused={true}
                     listQueryModules={app.listQueryModules.bind(app)}
                  />
               </Sidebar>

               <ContentArea isFocused={false}>
                  <Route path="/">
                     <Home />
                  </Route>
                  <Route path="/module/:encodedModulePath/query/:encodedFunctionName">
                     <QueryDetails getQuery={app.getQuery.bind(app)} />
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

