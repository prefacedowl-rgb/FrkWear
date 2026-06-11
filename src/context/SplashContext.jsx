import { createContext, useContext } from 'react'
export const SplashContext = createContext({ splashDone: true })
export const useSplash = () => useContext(SplashContext)
