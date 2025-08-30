import React, { useState } from "react";
import { render } from "ink";
import type { App } from "../app";
import { Router } from "./uiLibs/routing";
import { ShortcutsProvider } from "./uiLibs/shortcuts";
import { AppShell } from "./shell";

type UiAppProps = {
   app: App;
};
function UiApp({ app }: UiAppProps) {
   const [focused, setFocused] = useState<'Sidebar' | 'Content'>('Sidebar');

   const toggleFocused = () => setFocused(focused === 'Sidebar' ? 'Content' : 'Sidebar');
   const exitApp = () => process.exit(0);

   return (
      <Router>
         <ShortcutsProvider globalShortcuts={[
            { input: "escape", label: 'esc', type: "k", desc: "Quit", handler: exitApp },
            { input: "tab", type: "k", desc: "Toggle focus", handler: toggleFocused }
         ]}>
            <AppShell
               app={app}
               focused={focused}
               toggleFocused={toggleFocused}
            />
         </ShortcutsProvider>
      </Router>
   );
}

export function renderUiApp(app: App) {
   render(<UiApp app={app} />);
}

