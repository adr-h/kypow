import React from "react";
import { Box, render, Text } from "ink";
import { Router, Route } from "wouter";
import { memoryLocation } from "wouter/memory-location"
import type { App } from "../app";
import { Sidebar } from "./components/Sidebar";
import { QueryModulesList } from "./screens/QueryModulesList";
import { Home } from "./screens/Home";
import { ContentArea } from "./components/ContentArea";
import { QueryDetails } from "./screens/QueryDetails";

const height = 15;

type UiAppProps = {
   app: App;
};
function UiApp({ app }: UiAppProps) {
   const { hook, history, navigate } = memoryLocation({
      path: "/",
      record: true,
   });

   return (
      <Router hook={hook}>
         <Box flexDirection="row" height={height}>
            <Sidebar isFocused={true}>
               <QueryModulesList
                  height={height}
                  isFocused={true}
                  listQueryModules={app.listQueryModules.bind(app)}
               />
            </Sidebar>

            <ContentArea isFocused={false}>
               <Route path="/" component={Home} />
               <Route
                  path={'/module/:encodedModulePath/query/:encodedFunctionName'}
                  component={() => <QueryDetails getQuery={app.getQuery.bind(app)} />}
               />
            </ContentArea>
         </Box>
      </Router>
   );
}

export function renderUiApp(app: App) {
   render(<UiApp app={app} />);
}

