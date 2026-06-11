import{i as e,r as t}from"./GlitchText-Djc05Ey7.js";e();var n=t();function r({label:e,onClick:t,type:r=`button`,variant:i=`primary`,className:a=``}){let o=``;return i===`primary`?o=`bg-lime text-void border-lime hover:bg-void hover:text-lime`:(i===`ghost`||i===`outline`)&&(o=`bg-transparent text-lime border-lime hover:bg-lime hover:text-void`),(0,n.jsxs)(`button`,{type:r,onClick:t,className:`relative px-8 py-3 font-price text-2xl uppercase tracking-wider transition-all duration-300 overflow-hidden select-none border-2 ${o} ${a}`,children:[(0,n.jsx)(`style`,{children:`
        .btn-scanline {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to bottom,
            rgba(200, 255, 0, 0) 0%,
            rgba(200, 255, 0, 0.1) 50%,
            rgba(200, 255, 0, 0) 100%
          );
          transform: rotate(30deg) translateY(-100%);
          transition: transform 0.6s ease;
          pointer-events: none;
        }
        button:hover .btn-scanline {
          transform: rotate(30deg) translateY(100%);
        }
      `}),(0,n.jsx)(`div`,{className:`btn-scanline`}),(0,n.jsx)(`span`,{className:`relative z-10`,children:e})]})}export{r as t};