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
import { EditQueryParams } from "./screens/EditQueryParams";
import { ModuleDetails } from "./screens/ModuleDetails";

const height = 15;

type UiAppProps = {
   app: App;
};
function UiApp({ app }: UiAppProps) {
   const [tips, setTips] = useState<Tip[]>([]);
   const [focused, setFocused] = useState<'Sidebar' | 'Content'>('Sidebar');

   const toggleFocused = () => {
      setFocused(focused === 'Sidebar' ? 'Content' : 'Sidebar');
   }
   useInput((input, key) => {
      if (key.tab) return toggleFocused();
      if (input.toLowerCase() === 'q') return process.exit(0);
   });

   const isSidebarFocused = focused === 'Sidebar';
   const isContentFocused = focused === 'Content';

   return (
      <Router>
         <Box flexDirection="column" columnGap={0}>
            <NavigationTips tips={[
               {key: "q", desc: "Quit app"},
               {key: "tab", desc: "Toggle focus" },
               ...tips
            ]} />

            <Box flexDirection="row" height={height}>
               <Sidebar isFocused={isSidebarFocused}>
                  <QueryModulesList
                     maxHeight={height}
                     setTips={setTips}
                     isFocused={isSidebarFocused}
                     switchFocusToContent={toggleFocused}
                     listQueryModules={app.listQueryModules.bind(app)}
                  />
               </Sidebar>

               <ContentArea isFocused={isContentFocused}>
                  <Route path="/">
                     <Home />
                  </Route>

                  <Route path="/module/:encodedModulePath/details">
                     <ModuleDetails
                        setTips={setTips}
                        isFocused={isContentFocused}
                        maxHeight={height}
                        listQueries={app.listQueries.bind(app)}
                     />
                  </Route>

                  <Route path="/module/:encodedModulePath/query/:encodedFunctionName{/withParams/:encodedJsonFunctionParams}">
                     <QueryDetails
                        setTips={setTips}
                        isFocused={isContentFocused}
                        getQuery={app.getQuery.bind(app)}
                     />
                  </Route>

                  <Route path="/module/:encodedModulePath/query/:encodedFunctionName/editParams/:encodedJsonFunctionParams">
                     <EditQueryParams
                        setTips={setTips}
                        isFocused={isContentFocused}
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

