import React, { useState } from 'react';
import {render} from 'ink';
import type { App } from '../app';
import { ModuleDetails } from './ModuleDetails';
import { QueryDetails } from './QueryDetails';
import type { ScreenSelection } from './ScreenSelection';
import { ModuleBrowserPoc } from './ModuleBrowserPoc';

type RootProps = {
   app: App;
}
export function Root ({ app }: RootProps) {
   const [ selected, setSelected ] = useState<ScreenSelection>({
      screen: 'ModuleBrowser',
      props: {}
   });

   // WIP: discriminated-union based workaround because I'm too lazy to implement real routing for now
   function changeScreen(s: ScreenSelection) {
      setSelected(s);
   }

   if (selected.screen === 'ModuleBrowser') {
      return <ModuleBrowserPoc
         changeScreen={changeScreen}
         listQueryModules={app.listQueryModules.bind(app)}
      />;
   }

   if (selected.screen === 'ModuleDetails') {
      return <ModuleDetails
         changeScreen={changeScreen}
         listQueries={app.listQueries.bind(app)}
         modulePath={selected.props.modulePath}
      />
   }

   if (selected.screen === 'QueryDetails') {
      return <QueryDetails
         changeScreen={changeScreen}
         getQuery={app.getQuery.bind(app)}
         modulePath={selected.props.modulePath}
         functionName={selected.props.functionName}
      />
   }
}


export function renderRoot(app: App) {
   render(<Root app={app} />)
}