import React, { createContext, useContext } from 'react'
import { match } from 'path-to-regexp'
import { useRouter } from './Router'


type RouteMatchContextType = {
   params: Record<string, any>
}

const RouteMatchContext = createContext<RouteMatchContextType | null>(null)

export function Route({ path, children }: { path: string; children: React.ReactNode }) {
   const { pathname } = useRouter()
   const matcher = match(path, { decode: decodeURIComponent })
   const result = matcher(pathname)

   if (!result) return null

   return (
      <RouteMatchContext.Provider value={{ params: result.params }}>
         <React.Fragment key={JSON.stringify(result.params)}>
            {children}
         </React.Fragment>
      </RouteMatchContext.Provider>
   )
}

function useRouteMatch() {
   const ctx = useContext(RouteMatchContext)
   if (!ctx) throw new Error('useParams must be used inside a <Route>')
   return ctx
}

export function useParams() {
   return useRouteMatch().params
}
