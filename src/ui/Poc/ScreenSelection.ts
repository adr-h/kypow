export type ModuleBrowserSelection = {
   screen: 'ModuleBrowser',
   props: {
      initialModule?: string;
   }
};
export type ModuleDetailsSelection = {
   screen: 'ModuleDetails',
   props: {
      modulePath: string;
   }
}
export type QueryDetailsSelection = {
   screen: 'QueryDetails',
   props: {
      modulePath: string;
      functionName: string;
   }
}

export type ScreenSelection = ModuleBrowserSelection | ModuleDetailsSelection | QueryDetailsSelection;