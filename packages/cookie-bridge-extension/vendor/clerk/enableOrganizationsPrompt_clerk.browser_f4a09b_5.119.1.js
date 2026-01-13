"use strict";(globalThis.webpackChunk_clerk_clerk_js=globalThis.webpackChunk_clerk_clerk_js||[]).push([["7210"],{91219:function(e,i,t){t.r(i),t.d(i,{EnableOrganizationsPrompt:()=>f});var r=t(73312),n=t(61869),o=t(65909),a=t(69144),s=t(11576),l=t(56459),d=t(51217),c=t(86595),p=t(64204),h=t(37348),g=t(51164);let u=({caller:e,onSuccess:i,onClose:t})=>{let d=(0,n.cL)(),[u,f]=(0,a.useState)(!1),[b,x]=(0,a.useState)(!1),[w,C]=(0,a.useState)(!1),y=(0,a.useRef)(null),k=(0,s.useEnvironment)(),_=(0,a.useId)(),F=!e.startsWith("use"),M=void 0!==k?.organizationSettings.forceOrganizationSelection;return(0,r.tZ)(h.h,{children:(0,r.tZ)(l.Modal,{canCloseModal:!1,containerSx:()=>({alignItems:"center"}),initialFocusRef:y,children:(0,r.BX)(g.lc,{sx:()=>({display:"flex",flexDirection:"column",width:"30rem",maxWidth:"calc(100vw - 2rem)"}),children:[(0,r.BX)(p.Flex,{direction:"col",sx:e=>({padding:`${e.sizes.$4} ${e.sizes.$6}`,paddingBottom:e.sizes.$4,gap:e.sizes.$2}),children:[(0,r.BX)(p.Flex,{as:"header",align:"center",sx:e=>({gap:e.sizes.$2}),children:[(0,r.tZ)($,{isEnabled:b}),(0,r.tZ)("h1",{css:[g.Ui,(0,o.iv)`
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 500;
                    outline: none;
                  `],tabIndex:-1,ref:y,children:b?"Organizations feature enabled":"Organizations feature required"})]}),(0,r.tZ)(p.Flex,{direction:"col",align:"start",sx:e=>({gap:e.sizes.$0x5}),children:b?(0,r.BX)("p",{css:[g.Ui,(0,o.iv)`
                      color: #b4b4b4;
                      font-size: 0.8125rem;
                      font-weight: 400;
                      line-height: 1.3;
                    `],children:[d.user?'The Organizations feature has been enabled for your application. A default organization named "My Organization" was created automatically. You can manage or rename it in your':"The Organizations feature has been enabled for your application. You can manage it in your"," ",(0,r.tZ)(z,{href:"https://dashboard.clerk.com/~/organizations-settings",target:"_blank",rel:"noopener noreferrer",children:"dashboard"}),"."]}):(0,r.BX)(r.HY,{children:[(0,r.BX)("p",{id:_,css:[g.Ui,(0,o.iv)`
                        color: #b4b4b4;
                        font-size: 0.8125rem;
                        font-weight: 400;
                        line-height: 1.23;
                      `],children:["Enable Organizations to use"," ",(0,r.tZ)("code",{css:[g.Ui,(0,o.iv)`
                          font-size: 0.75rem;
                          color: white;
                          font-family: monospace;
                          line-height: 1.23;
                        `],children:F?`<${e} />`:e})," "]}),(0,r.tZ)(z,{href:"https://clerk.com/docs/guides/organizations/overview",target:"_blank",rel:"noopener noreferrer",children:"Learn more"})]})}),M&&!b&&(0,r.tZ)(p.Flex,{sx:e=>({marginTop:e.sizes.$2}),direction:"col",children:(0,r.BX)(Z,{value:w?"optional":"required",onChange:e=>C("optional"===e),labelledBy:_,children:[(0,r.tZ)(B,{value:"required",label:(0,r.BX)(p.Flex,{wrap:"wrap",sx:e=>({columnGap:e.sizes.$2,rowGap:e.sizes.$1}),children:[(0,r.tZ)("span",{children:"Membership required"}),(0,r.tZ)(v,{children:"Standard"})]}),description:(0,r.BX)(r.HY,{children:[(0,r.tZ)("span",{className:"block",children:"Users need to belong to at least one organization."}),(0,r.tZ)("span",{children:"Common for most B2B SaaS applications"})]})}),(0,r.tZ)(B,{value:"optional",label:"Membership optional",description:"Users can work outside of an organization with a personal account"})]})})]}),(0,r.tZ)("span",{css:(0,o.iv)`
              height: 1px;
              display: block;
              width: calc(100% - 2px);
              margin-inline: auto;
              background-color: #151515;
              box-shadow: 0px 1px 0px 0px #424242;
            `}),(0,r.tZ)(p.Flex,{justify:"center",sx:e=>({padding:`${e.sizes.$4} ${e.sizes.$6}`,gap:e.sizes.$3,justifyContent:"flex-end"}),children:b?(0,r.tZ)(m,{variant:"solid",onClick:()=>{d.user?i?.():(d.redirectToSignIn(),d.__internal_closeEnableOrganizationsPrompt?.())},children:d.user?"Continue":"Sign in to continue"}):(0,r.BX)(r.HY,{children:[(0,r.tZ)(m,{variant:"outline",onClick:()=>{d?.__internal_closeEnableOrganizationsPrompt?.(),t?.()},children:"I'll remove it myself"}),(0,r.tZ)(m,{variant:"solid",onClick:()=>{f(!0);let e={enable_organizations:!0};M&&(e.organization_allow_personal_accounts=w),new c.N().__internal_enableEnvironmentSetting(e).then(()=>{x(!0),f(!1)}).catch(()=>{f(!1)})},disabled:u,children:"Enable Organizations"})]})})]})})})},f=e=>(0,r.tZ)(d.InternalThemeProvider,{children:(0,r.tZ)(u,{...e})}),b=(0,o.iv)`
  ${g.Ui};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.75rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.12px;
  color: white;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.32);
  white-space: nowrap;
  user-select: none;
  color: white;
  outline: none;

  &:not(:disabled) {
    transition: 120ms ease-in-out;
    transition-property: background-color, border-color, box-shadow, color;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible:not(:disabled) {
    outline: 2px solid white;
    outline-offset: 2px;
  }
`,x={solid:(0,o.iv)`
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30.5%, rgba(0, 0, 0, 0.05) 100%), #454545;
  box-shadow:
    0 0 3px 0 rgba(253, 224, 71, 0) inset,
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 1px 0 0 rgba(255, 255, 255, 0.04) inset,
    0 0 0 1px rgba(0, 0, 0, 0.12),
    0 1.5px 2px 0 rgba(0, 0, 0, 0.48);

  &:hover:not(:disabled) {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30.5%, rgba(0, 0, 0, 0.15) 100%), #5f5f5f;
    box-shadow:
      0 0 3px 0 rgba(253, 224, 71, 0) inset,
      0 0 0 1px rgba(255, 255, 255, 0.04) inset,
      0 1px 0 0 rgba(255, 255, 255, 0.04) inset,
      0 0 0 1px rgba(0, 0, 0, 0.12),
      0 1.5px 2px 0 rgba(0, 0, 0, 0.48);
  }
`,outline:(0,o.iv)`
  border: 1px solid rgba(118, 118, 132, 0.25);
  background: rgba(69, 69, 69, 0.1);

  &:hover:not(:disabled) {
    border-color: rgba(118, 118, 132, 0.5);
  }
`},m=(0,a.forwardRef)(({variant:e="solid",...i},t)=>(0,r.tZ)("button",{ref:t,type:"button",css:[b,x[e]],...i})),v=({children:e})=>(0,r.tZ)("span",{css:(0,o.iv)`
        ${g.Ui};
        display: inline-flex;
        align-items: center;
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-size: 0.6875rem;
        font-weight: 500;
        line-height: 1.23;
        background-color: #ebebeb;
        color: #2b2b34;
        white-space: nowrap;
      `,children:e}),[w,C]=(0,n.uH)("RadioGroupContext"),Z=({value:e,onChange:i,children:t,labelledBy:n})=>{let o=(0,a.useId)(),s=a.useMemo(()=>({value:{name:o,value:e,onChange:i}}),[o,e,i]);return(0,r.tZ)(w.Provider,{value:s,children:(0,r.tZ)(p.Flex,{role:"radiogroup",direction:"col",gap:3,"aria-orientation":"vertical","aria-labelledby":n,children:t})})},y="1rem",k="0.5rem",B=({value:e,label:i,description:t})=>{let{name:n,value:s,onChange:l}=C(),d=(0,a.useId)(),c=e===s;return(0,r.BX)(p.Flex,{direction:"col",gap:1,children:[(0,r.BX)("label",{css:(0,o.iv)`
          ${g.Ui};
          display: flex;
          align-items: flex-start;
          gap: ${k};
          cursor: pointer;
          user-select: none;

          &:has(input:focus-visible) > span:first-of-type {
            outline: 2px solid white;
            outline-offset: 2px;
          }

          &:hover:has(input:not(:checked)) > span:first-of-type {
            background-color: rgba(255, 255, 255, 0.08);
          }

          &:hover:has(input:checked) > span:first-of-type {
            background-color: rgba(108, 71, 255, 0.8);
            background-color: color-mix(in srgb, #6c47ff 80%, transparent);
          }
        `,children:[(0,r.tZ)("input",{type:"radio",name:n,value:e,checked:c,onChange:()=>l(e),"aria-describedby":t?d:void 0,css:(0,o.iv)`
            ${g.Ui};
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
          `}),(0,r.tZ)("span",{"aria-hidden":"true",css:(0,o.iv)`
            ${g.Ui};
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: ${y};
            height: ${y};
            margin-top: 0.125rem;
            flex-shrink: 0;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.3);
            background-color: transparent;
            transition: 120ms ease-in-out;
            transition-property: border-color, background-color, box-shadow;

            ${c&&(0,o.iv)`
              border-width: 2px;
              border-color: #6c47ff;
              background-color: #6c47ff;
              background-color: color-mix(in srgb, #6c47ff 100%, transparent);
              box-shadow: 0 0 0 2px rgba(108, 71, 255, 0.2);
            `}

            &::after {
              content: '';
              position: absolute;
              width: 0.375rem;
              height: 0.375rem;
              border-radius: 50%;
              background-color: white;
              opacity: ${+!!c};
              transform: scale(${+!!c});
              transition: 120ms ease-in-out;
              transition-property: opacity, transform;
            }
          `}),(0,r.tZ)("span",{css:[g.Ui,(0,o.iv)`
              font-size: 0.875rem;
              font-weight: 500;
              line-height: 1.25;
              color: white;
            `],children:i})]}),t&&(0,r.tZ)("span",{id:d,css:[g.Ui,(0,o.iv)`
              padding-inline-start: calc(${y} + ${k});
              font-size: 0.75rem;
              line-height: 1.33;
              color: #c3c3c6;
              text-wrap: pretty;
            `],children:t})]})},z=(0,a.forwardRef)(({children:e,css:i,...t},n)=>(0,r.tZ)("a",{ref:n,...t,css:[g.Ui,(0,o.iv)`
            color: #a8a8ff;
            font-size: inherit;
            font-weight: 500;
            line-height: 1.3;
            font-size: 0.8125rem;
            min-width: 0;
          `,i],children:e})),$=({isEnabled:e})=>{let[i,t]=(0,a.useState)(0);(0,a.useLayoutEffect)(()=>{if(e)return void t(e=>180*(0===e));let i=setInterval(()=>{t(e=>180*(0===e))},2e3);return()=>clearInterval(i)},[e]);let n="idle",s="warning";e&&(0===i?(n="success",s="warning"):(s="success",n="idle"));let l=e=>{switch(e){case"idle":return(0,r.tZ)(g.Xz,{});case"success":return(0,r.tZ)(g.H8,{css:(0,o.iv)`
              width: 1.25rem;
              height: 1.25rem;
            `});case"warning":return(0,r.BX)("svg",{css:(0,o.iv)`
              width: 1.25rem;
              height: 1.25rem;
            `,viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[(0,r.tZ)("path",{opacity:"0.2",d:"M17.25 10C17.25 14.0041 14.0041 17.25 10 17.25C5.99594 17.25 2.75 14.0041 2.75 10C2.75 5.99594 5.99594 2.75 10 2.75C14.0041 2.75 17.25 5.99594 17.25 10Z",fill:"#EAB308"}),(0,r.tZ)("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M10 3.5C6.41015 3.5 3.5 6.41015 3.5 10C3.5 13.5899 6.41015 16.5 10 16.5C13.5899 16.5 16.5 13.5899 16.5 10C16.5 6.41015 13.5899 3.5 10 3.5ZM2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z",fill:"#EAB308"}),(0,r.tZ)("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M10 6C10.5523 6 11 6.44772 11 7V9C11 9.55228 10.5523 10 10 10C9.44772 10 9 9.55228 9 9V7C9 6.44772 9.44772 6 10 6Z",fill:"#EAB308"}),(0,r.tZ)("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M10 12C10.5523 12 11 12.4477 11 13V13.01C11 13.5623 10.5523 14.01 10 14.01C9.44772 14.01 9 13.5623 9 13.01V13C9 12.4477 9.44772 12 10 12Z",fill:"#EAB308"})]})}};return(0,r.tZ)("div",{css:(0,o.iv)`
        perspective: 1000px;
        width: 1.25rem;
        height: 1.25rem;
      `,children:(0,r.BX)("div",{css:(0,o.iv)`
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.6s ease-in-out;
          transform: rotateY(${i}deg);

          @media (prefers-reduced-motion: reduce) {
            transition: none;
          }
        `,children:[(0,r.tZ)("span",{"aria-hidden":!0,css:(0,o.iv)`
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            -webkit-font-smoothing: antialiased;
            transform: rotateY(0deg);
          `,children:l(n)}),(0,r.tZ)("span",{"aria-hidden":!0,css:(0,o.iv)`
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            transform: rotateY(180deg);
            display: flex;
            align-items: center;
            justify-content: center;
            -webkit-font-smoothing: antialiased;
          `,children:l(s)})]})})}},51164:function(e,i,t){t.d(i,{EA:()=>d,H8:()=>l,Ui:()=>s,Xz:()=>c,lc:()=>a});var r=t(73312),n=t(65909),o=t(64204);function a({children:e,sx:i,...t}){return(0,r.tZ)(o.Flex,{sx:e=>[{borderRadius:"1.25rem",fontFamily:e.fonts.$main,background:"linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 100%), #1f1f1f",boxShadow:"0px 0px 0px 0.5px #2F3037 inset, 0px 1px 0px 0px rgba(255, 255, 255, 0.08) inset, 0px 0px 0.8px 0.8px rgba(255, 255, 255, 0.20) inset, 0px 0px 0px 0px rgba(255, 255, 255, 0.72), 0px 16px 36px -6px rgba(0, 0, 0, 0.36), 0px 6px 16px -2px rgba(0, 0, 0, 0.20);"},i],...t,children:e})}let s=(0,n.iv)`
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  line-height: 1.5;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    avenir next,
    avenir,
    segoe ui,
    helvetica neue,
    helvetica,
    Cantarell,
    Ubuntu,
    roboto,
    noto,
    arial,
    sans-serif;
  text-decoration: none;
`;function l(e){return(0,r.tZ)("svg",{...e,viewBox:"0 0 16 17",fill:"none","aria-hidden":!0,xmlns:"http://www.w3.org/2000/svg",children:(0,r.BX)("g",{opacity:"0.88",children:[(0,r.tZ)("path",{d:"M13.8002 8.20039C13.8002 8.96206 13.6502 9.71627 13.3587 10.42C13.0672 11.1236 12.64 11.763 12.1014 12.3016C11.5628 12.8402 10.9234 13.2674 10.2198 13.5589C9.51607 13.8504 8.76186 14.0004 8.0002 14.0004C7.23853 14.0004 6.48432 13.8504 5.78063 13.5589C5.07694 13.2674 4.43756 12.8402 3.89898 12.3016C3.3604 11.763 2.93317 11.1236 2.64169 10.42C2.35022 9.71627 2.2002 8.96206 2.2002 8.20039C2.2002 6.66214 2.81126 5.18688 3.89898 4.09917C4.98669 3.01146 6.46194 2.40039 8.0002 2.40039C9.53845 2.40039 11.0137 3.01146 12.1014 4.09917C13.1891 5.18688 13.8002 6.66214 13.8002 8.20039Z",fill:"#22C543",fillOpacity:"0.16"}),(0,r.tZ)("path",{d:"M6.06686 8.68372L7.51686 10.1337L9.93353 6.75039M13.8002 8.20039C13.8002 8.96206 13.6502 9.71627 13.3587 10.42C13.0672 11.1236 12.64 11.763 12.1014 12.3016C11.5628 12.8402 10.9234 13.2674 10.2198 13.5589C9.51607 13.8504 8.76186 14.0004 8.0002 14.0004C7.23853 14.0004 6.48432 13.8504 5.78063 13.5589C5.07694 13.2674 4.43756 12.8402 3.89898 12.3016C3.3604 11.763 2.93317 11.1236 2.64169 10.42C2.35022 9.71627 2.2002 8.96206 2.2002 8.20039C2.2002 6.66214 2.81126 5.18688 3.89898 4.09917C4.98669 3.01146 6.46194 2.40039 8.0002 2.40039C9.53845 2.40039 11.0137 3.01146 12.1014 4.09917C13.1891 5.18688 13.8002 6.66214 13.8002 8.20039Z",stroke:"#22C543",strokeWidth:"1.2",strokeLinecap:"round",strokeLinejoin:"round"})]})})}function d(e){let i=new URL(e).href.match(/^https?:\/\/(.*?)\/apps\/app_(.+?)\/instances\/ins_(.+?)(?:\/.*)?$/);if(!i)throw Error("Invalid value Dashboard URL structure");return{baseDomain:`https://${i[1]}`,appId:`app_${i[2]}`,instanceId:`ins_${i[3]}`}}function c(){return(0,r.BX)("svg",{width:"1rem",height:"1.25rem",viewBox:"0 0 16 20",fill:"none","aria-hidden":!0,xmlns:"http://www.w3.org/2000/svg",children:[(0,r.BX)("g",{filter:"url(#filter0_i_438_501)",children:[(0,r.tZ)("path",{d:"M10.4766 9.99979C10.4766 11.3774 9.35978 12.4942 7.98215 12.4942C6.60452 12.4942 5.48773 11.3774 5.48773 9.99979C5.48773 8.62216 6.60452 7.50537 7.98215 7.50537C9.35978 7.50537 10.4766 8.62216 10.4766 9.99979Z",fill:"#BBBBBB"}),(0,r.tZ)("path",{d:"M12.4176 3.36236C12.6676 3.52972 12.6889 3.88187 12.4762 4.09457L10.6548 5.91595C10.4897 6.08107 10.2336 6.10714 10.0257 6.00071C9.41273 5.68684 8.71811 5.50976 7.98214 5.50976C5.5024 5.50976 3.49219 7.51998 3.49219 9.99972C3.49219 10.7357 3.66926 11.4303 3.98314 12.0433C4.08957 12.2511 4.06349 12.5073 3.89837 12.6724L2.07699 14.4938C1.86429 14.7065 1.51215 14.6851 1.34479 14.4352C0.495381 13.1666 0 11.641 0 9.99972C0 5.5913 3.57373 2.01758 7.98214 2.01758C9.62345 2.01758 11.1491 2.51296 12.4176 3.36236Z",fill:"#8F8F8F"}),(0,r.tZ)("path",{d:"M12.4762 15.905C12.6889 16.1177 12.6675 16.4698 12.4176 16.6372C11.149 17.4866 9.62342 17.982 7.9821 17.982C6.34078 17.982 4.81516 17.4866 3.54661 16.6372C3.29666 16.4698 3.27531 16.1177 3.48801 15.905L5.30938 14.0836C5.4745 13.9185 5.73066 13.8924 5.93851 13.9988C6.55149 14.3127 7.24612 14.4898 7.9821 14.4898C8.71808 14.4898 9.4127 14.3127 10.0257 13.9988C10.2335 13.8924 10.4897 13.9185 10.6548 14.0836L12.4762 15.905Z",fill:"#BBBBBB"})]}),(0,r.tZ)("defs",{children:(0,r.BX)("filter",{id:"filter0_i_438_501",x:"0",y:"1.86758",width:"12.6217",height:"16.1144",filterUnits:"userSpaceOnUse",colorInterpolationFilters:"sRGB",children:[(0,r.tZ)("feFlood",{floodOpacity:"0",result:"BackgroundImageFix"}),(0,r.tZ)("feBlend",{mode:"normal",in:"SourceGraphic",in2:"BackgroundImageFix",result:"shape"}),(0,r.tZ)("feColorMatrix",{in:"SourceAlpha",type:"matrix",values:"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0",result:"hardAlpha"}),(0,r.tZ)("feOffset",{dy:"-0.15"}),(0,r.tZ)("feGaussianBlur",{stdDeviation:"0.15"}),(0,r.tZ)("feComposite",{in2:"hardAlpha",operator:"arithmetic",k2:"-1",k3:"1"}),(0,r.tZ)("feColorMatrix",{type:"matrix",values:"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"}),(0,r.tZ)("feBlend",{mode:"normal",in2:"shape",result:"effect1_innerShadow_438_501"})]})})]})}}}]);