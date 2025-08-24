import React from 'react';

import { Box } from "ink";
import type { App } from "../../app";
import { NavigationTips } from "./NavigationTips";
import { QueryModulesList } from "../screens/QueryModulesList";
import { useShortcuts } from "../uiLibs/shortcuts";
import { Routes } from './routes';

const height = 15; // TODO: listen to process.stdout for max height instead of hardcoding

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
         <Content app={app} isFocused={focused === 'Content'} />
      </Box>
   </>
}

type ContentProps = {
   app: App;
   isFocused: boolean;
}
function Content({ app, isFocused }: ContentProps) {
   return <Box
      flexDirection="column"
      flexGrow={1}
      paddingX={2}
      borderStyle="round"
      borderColor={isFocused ? "green" : "white"}
   >
      <Routes app={app} isFocused={isFocused} maxHeight={height} />
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