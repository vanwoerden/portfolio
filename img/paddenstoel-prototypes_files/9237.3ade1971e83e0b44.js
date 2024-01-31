"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9237],{29237:function(e,t,n){n.r(t),n.d(t,{QuickLinksContainer:function(){return S},SearchBarInnerContainer:function(){return E},SearchBarOuterContainer:function(){return b},SearchBarResultContainer:function(){return I},default:function(){return B}});var r=n(93904),i=n(43593),o=n(99823),a=n(35274),s=n(29901),c=n(20759),l=n(19623),u=n(7379),d=n(59816),m=n(90676),g=n(23467),h=n(6189),f=e=>(0,l.ZP)(e),p={event:"search",type:"algemeen",component:"menu - main",suggestion:"0",alternative:"0"},w=(e,t)=>{f({...p,position:e.position,searchTerm:t})},v={event:"user_interaction",type:"card",component:"card-search-quick-link",action:"click"},y="api"===(0,u.X)()?"9HiNAIyTEXHTYwxMAslZzJbYvIn5pRPY":"pu3ixycanHlX9ItxAk92YTbaU1A9Qu6S",k=1125,b=g.ZP.div`
  ${({theme:e})=>g.iv`
  overflow: hidden;

  /* Negate spacing from NavigationActionSheetInnerContainer */
  margin: -${(0,h.Q)(e.spacing[100])} -${(0,h.Q)(e.spacing[400])};

  @media (min-width: ${(0,h.Q)(k)}) {
    margin: -${(0,h.Q)(e.spacing[400])};
  }
`}
`,E=g.ZP.div`
  ${()=>g.iv`
  height: 100%;

  ${o.Tr} {
    height: 100%;
  }
`}
`,I=g.ZP.div`
  ${({theme:e})=>g.iv`
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-bottom: ${(0,h.Q)(e.spacing[800])};

  @media (min-width: ${(0,h.Q)(e.viewportBreakpoint.lg)}) {
    padding-bottom: 0;
  }
`}
`,S=g.ZP.div`
  ${({theme:e})=>g.iv`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${(0,h.Q)(e.spacing[300])};
  padding: 0 ${(0,h.Q)(e.spacing[400])};
  margin-bottom: ${(0,h.Q)(e.spacing[450])};

  /** Default margin on Poncho 'Tags' component conflicts with the designed margins.
	 *  Margin above is handled by the title.
	 *  Margin below is handled by this QuickLinksContainer
	 */
  & > div {
    margin: 0;
  }
`}
`,C=({analytics:e,title:t,quickLinks:n=[]})=>{const r=(t,n)=>{((e,t,n,r)=>{f({...v,position:e.position,field:`card ${r}`,actionValue:t,linkUrl:n})})(e,t.label,t.src,n),window.location.assign(t.src)};if(0===n.length)return null;const i=n.map((e=>({text:e.label,url:e.src})));return s.createElement(s.Fragment,null,s.createElement(o.ZP.Title,null,t),s.createElement(S,null,s.createElement(m.Z,{items:i,onSelect:e=>{const t=n.findIndex((t=>t.label===e));t<0&&console.warn(`quick link for tag '${e}' not found in: ${n.join(",")}`),r(n[t],t)}})))},$="history-items",P=e=>{var t,n;t=$,n=JSON.stringify(e),"undefined"!==typeof window&&localStorage.setItem(t,n)},T=(e,t)=>e.filter((e=>e.toLowerCase()!==t.toLowerCase())),L=()=>{const e=(t=$,"undefined"!==typeof window?localStorage.getItem(t):null);var t;return e?JSON.parse(e):new Array},x=(e,t=5)=>{if(!e)return;const n=((e,t)=>[t,...T(e,t)])(L(),e),r=(o=t,(i=n).length>o?i.slice(0,o):i);var i,o;P(r)},Z=e=>{const[t,n]=(0,s.useState)([]),[r,i]=(0,s.useState)(L()),o=()=>{i(L())};return{suggestions:t.map((e=>{const t=r.findIndex((t=>t===e))>=0;return{id:e,value:e,isHistoryItem:t,icon:t?"history":"arrow-up-right"}})),historyItems:r.map((e=>({id:e,value:e,isHistoryItem:!0,icon:"history"}))),setSuggestionValues:e=>{n(e||[])},clearSuggestions:()=>{n([])},addNewHistoryItem:t=>{x(t,e),o()},removeHistoryItem:e=>{(e=>{if(!e)return;const t=L(),n=T(t,e);P(n)})(e),o()}}},A={position:"header"},Q=e=>{window.location.assign(`/search?q=${e}`)},H=()=>document.querySelector("[data-fusion-search-bar-render-target]")||(()=>{const e=document.createElement("div");return e.setAttribute("data-fusion-search-bar-render-target",""),document.body&&document.body.appendChild(e),e})(),q=e=>{e&&document.body&&document.body.contains(e)&&document.body.removeChild(e)},N=()=>{if(!(/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream))return;const e=setInterval((()=>{0!==window.pageYOffset&&clearInterval(e),window.scroll(0,0)}),50);setTimeout((()=>{clearInterval(e)}),1e3)},B=({analytics:e=A,quickLinks:t=[],suggestionAmount:n=5,maxHistoryAmount:l=5,inputFieldPlaceholder:u="Ik ben op zoek naar...",tagsTitle:m="Snel naar",historyTitle:g="Eerder gezocht naar",suggestionsTitle:h="Suggesties",resultFieldLinkLabel:v="Bekijk alle resultaten voor",isActive:k,onClose:S})=>{const[$,P]=(0,s.useState)(!1),[T,L]=(0,s.useState)(!1),[x,B]=(0,s.useState)(""),F=((e,t=300)=>{const[n,r]=(0,s.useState)(e);return(0,s.useEffect)((()=>{const n=setTimeout((()=>{r(e)}),t);return()=>{clearTimeout(n)}}),[e,t]),n})(x),{suggestions:R,historyItems:O,setSuggestionValues:V,clearSuggestions:Y,addNewHistoryItem:_,removeHistoryItem:j}=Z(l),[M,z]=(0,s.useState)(void 0),J=()=>{P(!1),S()},U=async(e,t)=>{if(e){L(!0);try{const{suggestions:r}=await(({query:e,rows:t=5})=>(0,d.W)({url:`/v1/internal-search/suggest?q=${e}&rows=${t}`},{clientId:y}).then((e=>e.json().then((e=>e)))))({query:e,rows:t});V((n=r,Array.from(new Set(n))))}catch(r){}finally{L(!1)}var n;z(await(e=>(0,d.W)({url:`/v1/internal-search?q=${e}&rows=0`},{clientId:y}).then((e=>e.json().then((e=>e.total)))))(e))}else Y()};(0,s.useEffect)((()=>{U(F,n)}),[F,n]),(0,s.useEffect)((()=>{if(k){const e=document.getElementById("fusion-search-bar-navigation");e&&e.focus()}}),[k]);const X=t=>{var n,r;n=e,r=t,f({...p,position:n.position,searchTerm:r,suggestion:"1"}),_(t),Q(t)},D=t=>{var n,r;n=e,r=t,f({...p,position:n.position,searchTerm:r,suggestion:"2"}),_(t),Q(t)},W=()=>{var t,n;t=e,n=x,f({...p,position:t.position,searchTerm:n,suggestion:"3"}),_(x),Q(x)},K=(0,s.useRef)(null),G=(0,s.useRef)(null),[ee,te]=(0,s.useState)(void 0);(0,r.Q)({ref:G,onClickOutside:J});const ne=()=>{if(G.current&&K.current){const{top:e,left:t,width:n}=K.current.getBoundingClientRect();G.current.style.setProperty("--search-bar-top",`${e}px`),G.current.style.setProperty("--search-bar-left",`${t}px`),G.current.style.setProperty("--search-bar-width",`${n}px`)}},re=(0,i.S)(),ie=()=>{(0,a.tP)(),N()};(0,s.useEffect)((()=>{["small","medium"].includes(re)&&$?setTimeout((()=>{window.scroll(0,0),G.current&&(0,a.Qp)(G.current),N()}),0):ie()}),[re,$]),(0,s.useEffect)((()=>{const e=({keyCode:e})=>{27===e&&P(!1)},t=new c.Z((()=>{K.current&&ne()})),n=()=>{ne()},r=()=>window.removeEventListener("scroll",n),i=()=>document.removeEventListener("keydown",e);return $?(K.current&&(ne(),t.observe(K.current)),te(H()),window.addEventListener("scroll",n),document.addEventListener("keydown",e)):(G.current?.focus(),q(ee),i(),r(),t.disconnect()),()=>{i(),r(),t.disconnect(),q(ee),ie()}}),[$]);const oe=e=>e.map(((t,n)=>s.createElement(o.ZP.Item,{key:t.id,id:t.id,value:t.value,highlightValue:x.toLowerCase(),icon:t.icon,showCross:t.isHistoryItem,hideUnderline:n===e.length-1,titleCase:!0,onClick:t.isHistoryItem?D:X,onCrossClick:t.isHistoryItem?j:void 0}))),ae=oe(R),se=oe(O);return s.createElement(b,null,s.createElement(E,null,s.createElement(o.ZP,{reference:"fusion-search-bar-navigation",inputValue:x,placeholder:u,showResultPanel:!0,hideBoxShadow:!0,onChange:e=>{const t=e.target.value;B(t)},onFocus:()=>{P(!0)},onLeftArrowIconClick:J,onRightArrowIconClick:()=>{w(e,x),_(x),Q(x)},onClearIconClick:()=>{B(""),Y()},onKeyDown:t=>{"Enter"===t.key?(w(e,x),Q(x)):"Escape"===t.key||"Tab"===t.key?(P(!1),t.currentTarget.blur()):P(!0)},autoFocus:!0},s.createElement(I,null,s.createElement(C,{analytics:e,title:m,quickLinks:t}),ae.length?s.createElement(s.Fragment,null,s.createElement(o.ZP.Title,null,h),ae,s.createElement(o.ZP.Link,{id:v+x,label:v,suffixLabel:x,count:M,onClick:W})):O.length?s.createElement(s.Fragment,null,s.createElement(o.ZP.Title,null,g),se):T?s.createElement(o.ZP.LoadingIndicator,null):void 0))))}}}]);