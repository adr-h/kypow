import React from 'react';

import { Box } from "ink";
import type { App } from "../../app";
import { NavigationTips } from "./NavigationTips";
import { useShortcuts } from "../uiLibs/shortcuts";
import { Routes } from './routes';
import { ModuleSearch } from '../screens/ModuleSearch';
import { AppReadyLoader } from '../AppReadyLoader';
import { useTerminalSize } from '../uiLibs/useTerminalSize';

const MINIMUM_HEIGHT = 18;
const HEIGHT_PADDING = 2; // using the full terminal height sometimes causes clipping

type ShellProps = {
   focused: 'Sidebar' | 'Content';
   app: App;
   toggleFocused: () => void;
}
export function AppShell({ app, focused, toggleFocused }: ShellProps) {
   const shortcuts = useShortcuts();
   const { rows } = useTerminalSize();
   const maxHeight = Math.max(rows - HEIGHT_PADDING, MINIMUM_HEIGHT);

   return <Box flexDirection="column" gap={0} height={maxHeight}>
      <Box flexDirection="row" flexGrow={1} gap={0}>
         <Sidebar app={app} isFocused={focused === 'Sidebar'} toggleFocused={toggleFocused} maxHeight={maxHeight}/>
         <Content app={app} isFocused={focused === 'Content'} maxHeight={maxHeight}/>
      </Box>
      <NavigationTips tips={shortcuts.enabledTips}/>
   </Box>
}

type ContentProps = {
   app: App;
   isFocused: boolean;
   maxHeight: number;
}
function Content({ app, isFocused, maxHeight }: ContentProps) {
   return <Box
      flexDirection="column"
      flexGrow={1}
      paddingX={2}
      borderStyle="single"
      borderColor={isFocused ? "green" : "white"}
   >
      <AppReadyLoader app={app}>
         <Routes app={app} isFocused={isFocused} maxHeight={maxHeight} />
      </AppReadyLoader>
   </Box>
}

type SidebarProps = {
   isFocused: boolean;
   app: App;
   maxHeight: number;
   toggleFocused: () => void;
}
function Sidebar({ app, isFocused, toggleFocused, maxHeight }: SidebarProps) {
   return (
      <Box
         flexDirection="column"
         paddingX={1}
         borderStyle="single"
         borderColor={isFocused ? "green" : "white"}
      >
         <ModuleSearch
            maxHeight={maxHeight}
            isFocused={isFocused}
            switchFocusToContent={toggleFocused}
            searchModules={app.searchModules.bind(app)}
         />
      </Box>
   );
};