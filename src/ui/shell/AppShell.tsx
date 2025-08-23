import React from 'react';
import { Box } from "ink";
import type { App } from "../../app";
import { NavigationTips } from "./NavigationTips";
import { EditQueryParams } from "../screens/EditQueryParams";
import { Home } from "../screens/Home";
import { ModuleDetails } from "../screens/ModuleDetails";
import { QueryDetails } from "../screens/QueryDetails";
import { QueryModulesList } from "../screens/QueryModulesList";
import { Route } from "../uiLibs/routing";
import { useShortcuts } from "../uiLibs/shortcuts";

const height = 15;

type ShellProps = {
   focused: 'Sidebar' | 'Content';
   app: App;
   toggleFocused: () => void;
}
export function AppShell({ app, focused, toggleFocused }: ShellProps) {
   const shortcuts = useShortcuts();

   return <>
      <NavigationTips tips={shortcuts.enabledTips} />
      <Box flexDirection="row" height={height}>
         <Sidebar app={app} isFocused={focused === 'Sidebar'} toggleFocused={toggleFocused} />
         <Routes app={app} isFocused={focused === 'Content'} />
      </Box>
   </>
}

type ContentProps = {
   app: App;
   isFocused: boolean;
}
function Routes({ app, isFocused }: ContentProps) {
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
            isFocused={isFocused}
            maxHeight={height}
            listQueries={app.listQueries.bind(app)}
         />
      </Route>

      <Route path="/module/:encodedModulePath/query/:encodedFunctionName{/withParams/:encodedJsonFunctionParams}">
         <QueryDetails
            isFocused={isFocused}
            maxHeight={height}
            getQuery={app.getQuery.bind(app)}
         />
      </Route>

      <Route path="/module/:encodedModulePath/query/:encodedFunctionName/editParams/:encodedJsonFunctionParams">
         <EditQueryParams isFocused={isFocused} />
      </Route>
   </Box>
}


type SidebarProps = {
   isFocused: boolean;
   app: App;
   toggleFocused: () => void;
}
function Sidebar({ app, isFocused, toggleFocused }: SidebarProps) {
   return (
      <Box
         flexDirection="column"
         paddingX={1}
         borderStyle="round"
         borderColor={isFocused ? "green" : "white"}
      >
         <QueryModulesList
            maxHeight={height}
            isFocused={isFocused}
            switchFocusToContent={toggleFocused}
            listQueryModules={app.listQueryModules.bind(app)}
         />
      </Box>
   );
};