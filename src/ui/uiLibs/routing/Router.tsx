/**
 * Extraordinarily lightweight Routing components
 */
import React, { useState, useContext, createContext } from "react"

type RouterContextType = {
   pathname: string
   navigate: (to: string) => void
}

const RouterContext = createContext<RouterContextType | null>(null)

export function RouterProvider({ children }: { children: React.ReactNode }) {
   const [pathname, setPathname] = useState('/')
   return (
      <RouterContext.Provider value={{ pathname, navigate: setPathname }}>
         {children}
      </RouterContext.Provider>
   )
}

export function useRouter() {
   const ctx = useContext(RouterContext)
   if (!ctx) throw new Error('useRouter must be inside RouterProvider')
   return ctx
}

export function useNavigate() {
   return useRouter().navigate
}
