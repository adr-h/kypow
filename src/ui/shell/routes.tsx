import React from 'react';

import type { App } from '../../app';
import { Route } from '../uiLibs/routing';
import { Home } from '../screens/Home';
import { EditQueryParams } from '../screens/EditQueryParams';
import { ModuleDetails } from '../screens/ModuleDetails';
import { QueryDetails } from '../screens/QueryDetails';
import { QueryExecution } from '../screens/QueryExecution';

type ContentProps = {
   app: App;
   maxHeight: number;  // TODO: make a hook
   isFocused: boolean; // TODO: central focus management
}
export function Routes({ app, isFocused, maxHeight }: ContentProps) {
   return <>
      <Route path="/">
         <Home />
      </Route>

      <Route path="/module/:encodedModulePath/details">
         <ModuleDetails
            isFocused={isFocused}
            maxHeight={maxHeight}
            listQueries={app.listQueries.bind(app)}
         />
      </Route>

      <Route path="/module/:encodedModulePath/query/:encodedFunctionName/execute/:encodedJsonFunctionParams">
         <QueryExecution
            isFocused={isFocused}
            maxHeight={maxHeight}
            executeQuery={app.executeQuery.bind(app)}
         />
      </Route>

      <Route path="/module/:encodedModulePath/query/:encodedFunctionName{/withParams/:encodedJsonFunctionParams}">
         <QueryDetails
            isFocused={isFocused}
            maxHeight={maxHeight}
            getQuery={app.getQuery.bind(app)}
         />
      </Route>

      <Route path="/module/:encodedModulePath/query/:encodedFunctionName/editParams/:encodedJsonFunctionParams">
         <EditQueryParams isFocused={isFocused} />
      </Route>
   </>
}