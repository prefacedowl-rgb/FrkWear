import React, { Suspense } from 'react'
import Spline from '@splinetool/react-spline'

export default function SplineViewer() {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center text-lime font-mono text-xs uppercase tracking-widest">
        INITIALIZING VECTOR GRAPHIC...
      </div>
    }>
      <div className="w-full h-full relative select-none pointer-events-auto">
        {/* CSS filters to ensure color theme matches website (lime/pink/void) */}
        <Spline 
          scene="https://prod.spline.design/kAlWrZ4XbaX3bB3W/scene.splinecode" 
          className="w-full h-full filter contrast-[1.1] brightness-[1.05]"
        />
      </div>
    </Suspense>
  )
}
