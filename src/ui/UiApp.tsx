import React, { useState } from "react";
import { Box, render, useInput } from "ink";
import type { App } from "../app";
import { QueryModulesList } from "./screens/QueryModulesList";
import { Home } from "./screens/Home";
import { QueryDetails } from "./screens/QueryDetails";
import { Router, Route } from "./uiLibs/routing";
import { NavigationTips } from "./components/NavigationTips";
import type { Tip } from "./components/NavigationTips/NavigationTips";
import { EditQueryParams } from "./screens/EditQueryParams";
import { ModuleDetails } from "./screens/ModuleDetails";
import { AppReadyLoader } from "./components/AppReadyLoader";

const height = 15;

type UiAppProps = {
   app: App;
};
function UiApp({ app }: UiAppProps) {
   const [tips, setTips] = useState<Tip[]>([]);

   const [focused, setFocused] = useState<'Sidebar' | 'Content'>('Sidebar');
   const toggleFocused = () => setFocused(focused === 'Sidebar' ? 'Content' : 'Sidebar');

   useInput((input, key) => {
      if (key.tab) return toggleFocused();
      if (input.toLowerCase() === 'q') return process.exit(0);
   });
   const globalTips = [{ key: "q", desc: "Quit app" }, { key: "tab", desc: "Toggle focus" }]

   return (
      <Router>
         <AppReadyLoader app={app}>
            <Box flexDirection="column" columnGap={0}>
               <NavigationTips tips={[...globalTips, ...tips]} />

               <Box flexDirection="row" height={height}>
                  <Sidebar app={app} isFocused={focused === 'Sidebar'} setTips={setTips} toggleFocused={toggleFocused} />
                  <Content app={app} isFocused={focused === 'Content'} setTips={setTips} />
               </Box>
            </Box>
         </AppReadyLoader>
      </Router>
   );
}

type ContentProps = {
   app: App;
   isFocused: boolean;
   setTips: (a: Tip[]) => void;
}
function Content({ app, isFocused, setTips }: ContentProps) {
   return <Box
      flexDirection="column"
      flexGrow={1}
      paddingX={2}
      borderStyle="round"
      borderColor={isFocused ? "green" : "white"}
   >
      <Route path="/">
         <Home />
      </Route>

      <Route path="/module/:encodedModulePath/details">
         <ModuleDetails
            setTips={setTips}
            isFocused={isFocused}
            maxHeight={height}
            listQueries={app.listQueries.bind(app)}
         />
      </Route>

      <Route path="/module/:encodedModulePath/query/:encodedFunctionName{/withParams/:encodedJsonFunctionParams}">
         <QueryDetails
            setTips={setTips}
            isFocused={isFocused}
            maxHeight={height}
            getQuery={app.getQuery.bind(app)}
         />
      </Route>

      <Route path="/module/:encodedModulePath/query/:encodedFunctionName/editParams/:encodedJsonFunctionParams">
         <EditQueryParams
            setTips={setTips}
            isFocused={isFocused}
         />
      </Route>
   </Box>
}


type SidebarProps = {
   isFocused: boolean;
   app: App;
   toggleFocused: () => void;
   setTips: (a: Tip[]) => void;
}
function Sidebar({ app, isFocused, toggleFocused, setTips }: SidebarProps) {
   return (
      <Box
         flexDirection="column"
         paddingX={1}
         borderStyle="round"
         borderColor={isFocused ? "green" : "white"}
      >
         <QueryModulesList
            maxHeight={height}
            setTips={setTips}
            isFocused={isFocused}
            switchFocusToContent={toggleFocused}
            listQueryModules={app.listQueryModules.bind(app)}
         />
      </Box>
   );
};

export function renderUiApp(app: App) {
   render(<UiApp app={app} />);
}

