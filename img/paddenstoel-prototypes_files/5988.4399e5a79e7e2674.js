"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5988],{88372:function(e,t,o){var n=o(29901),r=o(87608),i=o.n(r),a=o(2929),l=o(80197),c=function(e,t){var o={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(o[n]=e[n]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var r=0;for(n=Object.getOwnPropertySymbols(e);r<n.length;r++)t.indexOf(n[r])<0&&Object.prototype.propertyIsEnumerable.call(e,n[r])&&(o[n[r]]=e[n[r]])}return o};const s=(0,n.forwardRef)((function(e,t){var{kind:o,icon:r,size:s,class:d,className:u,dataTest:m="button-icon",disabled:g=!1}=e,p=c(e,["kind","icon","size","class","className","dataTest","disabled"]);const b=i()("PONCHO-button--icon",d,u);return n.createElement(l.MQ,Object.assign({className:b,type:"button","data-test":`${m}-container`,ref:t,$disabled:g,disabled:g},p),n.createElement(a.ZP,{type:o,variant:r,size:s,dataTest:m}))}));t.Z=s},80197:function(e,t,o){o.d(t,{qO:function(){return b},v3:function(){return f},MQ:function(){return $},oD:function(){return v}});var n=o(20819),r=o(2929),i=o(6189),a=o(99374),l=o(49087),c=o(51035);const s=({theme:e})=>n.css`
	background: ${e.colors.gradients.buttonPrimary};

	${v}, ${f} {
		color: ${e.colors.blanc.textButton};
	}

	&:focus,
	&:hover {
		background: ${e.colors.gradients.buttonPrimaryHover};
	}

	&:active {
		background: ${e.colors.gradients.buttonPrimaryActive};
	}
`,d=({theme:e})=>n.css`
	padding-top: ${(0,i.Q)(Number(e.spacing[200])-Number(e.borderWidth[2]))};
	padding-bottom: ${(0,i.Q)(Number(e.spacing[200])-Number(e.borderWidth[2]))};
	border: ${(0,i.Q)(e.borderWidth[2])} solid ${e.colors.base.borderButton};

	${v}, ${f} {
		color: ${e.colors.base.textBody};
	}

	&:focus,
	&:hover {
		border: ${(0,i.Q)(e.borderWidth[2])} solid ${e.colors.highlight.borderHover};

		${v}, ${f} {
			color: ${e.colors.highlight.textHover};
		}
	}

	&:active {
		border: ${(0,i.Q)(e.borderWidth[2])} solid
			${e.colors.action.borderButtonInverseActive};

		${v}, ${f} {
			color: ${e.colors.action.textButtonInverseActive};
		}
	}
`,u=({theme:e,$visualStyle:t})=>n.css`
	&& {
		padding-top: ${(0,i.Q)(Number(e.spacing[100])-1)};
		padding-bottom: ${(0,i.Q)(Number(e.spacing[100])-1)};

		${"secondary"===t&&n.css`
			padding: ${(0,i.Q)(Number(e.spacing[100])-(1+Number(e.borderWidth[2])))}
				${(0,i.Q)(Number(e.spacing[350])-Number(e.borderWidth[2]))};
		`}
	}
`,m=({theme:e})=>n.css`
	background: ${e.colors.gradients.buttonPrimaryDecide};
	color: ${e.colors.base.textButton};

	${v}, ${f} {
		color: ${e.colors.base.textButton};
	}

	&:focus,
	&:hover {
		background: ${e.colors.gradients.bgButtonPrimaryDecideHover};

		${v}, ${f} {
			color: ${e.colors.base.textButton};
		}
	}

	&:active {
		background: ${e.colors.gradients.bgButtonPrimaryDecideActive};

		${v}, ${f} {
			color: ${e.colors.base.textButton};
		}
	}

	${c.G.name===e.name&&n.css`
		color: ${e.colors.blanc.textButton};

		${v}, ${f} {
			color: ${e.colors.blanc.textButton};
		}

		&:focus,
		&:hover {
			${v}, ${f} {
				color: ${e.colors.blanc.textButton};
			}
		}

		&:active {
			${v}, ${f} {
				color: ${e.colors.blanc.textButton};
			}
		}
	`}
`,g=({theme:e})=>n.css`
	background: transparent;
	border: ${(0,i.Q)(e.borderWidth[2])} solid ${e.colors.blanc.borderButtonInverse};

	${v}, ${f} {
		color: ${e.colors.blanc.textButtonInverse};
	}

	&:focus,
	&:hover {
		border: ${(0,i.Q)(e.borderWidth[2])} solid ${e.colors.medium.borderButtonInverseHover};

		${v}, ${f} {
			color: ${e.colors.medium.textButtonInverseHover};
		}
	}

	&:active {
		border: ${(0,i.Q)(e.borderWidth[2])} solid
			${e.colors.action.borderButtonInverseActive};

		${v}, ${f} {
			color: ${e.colors.action.textButtonInverseActive};
		}
	}
`,p=({theme:e})=>n.css`
	border: ${(0,i.Q)(e.borderWidth[2])} solid ${e.colors.base.borderTabbox};
	padding: 0;
	overflow: hidden;
	display: inline-block;

	> ${v} {
		display: flex;
		justify-content: center;
		color: ${e.colors.base.textButton};

		> span {
			flex: 1;
			padding-top: ${(0,i.Q)(Number(e.spacing[200])-Number(e.borderWidth[2]))};
			padding-bottom: ${(0,i.Q)(Number(e.spacing[200])-Number(e.borderWidth[2]))};

			&.active {
				color: ${e.colors.blanc.textButton};
				background: ${e.colors.base.bgTabTabboxActive};

				&:after {
					content: url(${`${l.H}/poncho/button/images/toggle-icon.svg`});
					margin-left: ${(0,i.Q)(e.spacing[200])};
				}
			}

			&:not(.active) {
				background: ${e.colors.blanc.bgTabboxContent};
			}
		}
	}
`,b=n.default.button`
	${({theme:e,$variant:t,$visualStyle:o,$useBackgroundFill:r})=>n.css`
	// added higher specificity to override core-ui styling
	&&& {
		display: ${"toggle"===t?"inline-block":"inline-flex"};
		align-items: center;
		background: ${r?e.colors.blanc.bgButton:"transparent"};

		gap: ${(0,i.Q)(e.spacing[200])};
		justify-content: center;
		width: 100%;
		margin: 0;
		padding: ${(0,i.Q)(e.spacing[200])} ${(0,i.Q)(e.spacing[350])};
		border-radius: ${(0,i.Q)(e.borderRadius.m)};
		border: none; // remove CORE-UI added border
		cursor: pointer;
		text-align: center;
		text-decoration: none;
		text-transform: none;
		line-height: ${(0,i.Q)(e.lineHeights[400])};

		@media (min-width: ${(0,i.Q)(e.viewportBreakpoint.sm)}) {
			${"toggle"!==t&&n.css`
				width: auto;
			`}
		}

		&:hover {
			${f}:first-child {
				right: 3px;
			}

			${f}:last-child {
				left: 3px;
			}
		}

		${(({variant:e})=>e&&{primary:s,secondary:d,tertiary:u,decide:m,icon:null,toggle:p}[e])({variant:t})}
		${(({visualStyle:e})=>e&&{primary:s,secondary:d,inverted:g,decide:m}[e])({visualStyle:o})}
	}
`}
`,v=(0,n.default)(a.Co).attrs({variant:"button-link"})``,f=(0,n.default)(r.ZP)`
	${()=>n.css`
	font-weight: normal;
	position: relative;

	transition: all 0.2s;

	&:first-child {
		right: 0;
	}

	&:last-child {
		left: 0;
	}
`}
`,$=n.default.button`
	${({theme:e,$disabled:t})=>n.css`
	padding: ${(0,i.Q)(e.spacing[200])};
	border: none;
	border-radius: ${(0,i.Q)(e.borderRadius.m)};
	color: ${e.colors.highlight.iconHover};
	font-size: ${(0,i.Q)(18)}; // TODO: use design-token from anwb/icon when migrating that to SC
	line-height: ${(0,i.Q)(18)}; // TODO: use design-token from anwb/icon when migrating that to SC
	background: transparent;

	${!t&&n.css`
		&:focus,
		&:hover {
			> span {
				color: ${e.colors.base.iconButton};
			}
		}
		&:active {
			> span {
				color: ${e.colors.action.iconActive};
			}
		}
	`}
`}
`},2929:function(e,t,o){o.d(t,{ZP:function(){return d}});var n=o(29901),r=o(87608),i=o.n(r);const a={"arrow-up-left-straight":"arrow-up-left","arrow-up-right-straight":"arrow-up-right",share_ios:"share-ios",OV:"ov"};const l=(e,t)=>{if(function(e,t){return"ui"===e&&Object.keys(a).includes(t)}(e,t)){return a[t]}return t};var c=o(18158),s=function(e,t){var o={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(o[n]=e[n]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var r=0;for(n=Object.getOwnPropertySymbols(e);r<n.length;r++)t.indexOf(n[r])<0&&Object.prototype.propertyIsEnumerable.call(e,n[r])&&(o[n[r]]=e[n[r]])}return o};var d=e=>{var{className:t,size:o="md",type:r="ui",variant:a,dataTest:d="icon"}=e,u=s(e,["className","size","type","variant","dataTest"]);const m="string"===typeof o?o:o.initial,g=i()("PONCHO-icon",t,{[`PONCHO-icon--${m||""}`]:m,[`PONCHO-icon--${r||""}`]:r});return n.createElement(c.qk,Object.assign({className:g,"data-test":d,$size:o,$type:r,$variant:l(r,a)},u),"\xa0")}},18158:function(e,t,o){o.d(t,{O:function(){return a},qk:function(){return l}});var n=o(20819),r=o(23133),i=o(6189);const a={xs:12,sm:14,md:16,lg:18,xl:22,xxl:28,xxxl:34,jumbo:40,"jumbo-xl":50,"jumbo-xxl":60,"jumbo-xxxl":70,mega:80},l=n.default.span`
	${({theme:e,$size:t,$type:o,$variant:l})=>{const c="string"===typeof t?{initial:t}:t,s=Object.keys(c).filter((e=>"initial"!==e));return n.css`
		background-color: currentColor;
		display: inline-block;
		mask: url(${(0,r.m)(l,o)}) no-repeat center right;
		min-height: ${(0,i.Q)(a[c.initial])};
		width: ${(0,i.Q)(a[c.initial])};

		${s.map((t=>n.css`
				@media (min-width: ${(0,i.Q)(e.viewportBreakpoint[t])}) {
					min-height: ${(0,i.Q)(a[c[t]])};
					width: ${(0,i.Q)(a[c[t]])};
				}
			`))}
	`}}
`},23467:function(e,t,o){o.d(t,{ZP:function(){return l},iv:function(){return a}});var n=o(22310),r=(o(29901),o(20819)),i=(r.createGlobalStyle`
  // some global styles
`,n.d,r.default),a=r.css,l="function"===typeof i?i:i.default},99823:function(e,t,o){o.d(t,{Tr:function(){return P},ZP:function(){return j}});var n=o(29901),r=o(20819),i=o(2929),a=o(6189),l=o(99374);const c=r.default.div`
	${({theme:e})=>r.css`
	&:hover {
		background-color: ${e.colors.extralight.bgPillHover};
	}
`}
`,s=r.default.div`
	${({theme:e,$hideUnderline:t})=>r.css`
	display: flex;
	align-items: center;
	margin: 0 ${(0,a.Q)(e.spacing[400])};

	${!t&&r.css`
		border-bottom: ${(0,a.Q)(e.borderWidth[2])} solid ${e.colors.light.divider};
	`}

	padding: ${(0,a.Q)(e.spacing[200])} 0;
	cursor: pointer;
`}
`,d=(0,r.default)(i.ZP)`
	${({theme:e,$showHoverEffect:t})=>r.css`
	color: ${e.colors.medium.iconInactive};
	margin-right: ${(0,a.Q)(e.spacing[100])};

	${t&&r.css`
		&:hover {
			color: ${e.colors.highlight.iconInteractive};
		}
	`}
`}
`,u=r.default.div`
	${()=>r.css`
	margin-left: auto;
`}
`,m=(0,r.default)(l.Co).attrs((()=>({variant:"body-text"})))`
	${({$titleCase:e})=>r.css`
	margin: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;

	${e&&r.css`
		&::first-letter {
			text-transform: capitalize;
		}
	`}
`}
`,g="cross-icon";var p=o(79017);const b=r.default.div`
	${({theme:e})=>r.css`
	display: flex;
	align-items: center;
	padding: ${(0,a.Q)(e.spacing[400])};
	padding-bottom: ${(0,a.Q)(e.spacing[200])};
`}
`,v=(0,r.default)(i.ZP)`
	${({theme:e})=>r.css`
	color: ${e.colors.highlight.textLink};
	margin-right: ${(0,a.Q)(e.spacing[100])};
`}
`,f=r.default.div`
	${()=>r.css`
	flex-grow: 2;
	display: flex;
	align-items: center;
	overflow: hidden;
	cursor: pointer;

	&:hover {
		text-decoration: underline;
	}
`}
`,$=(0,r.default)(l.Co).attrs((()=>({variant:"link-text"})))`
	${()=>r.css`
	max-width: unset;
	margin: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	text-decoration: none;
`}
`,h=(0,r.default)(l.Co).attrs((()=>({variant:"body-text"})))`
	${({theme:e})=>r.css`
	color: ${e.colors.informative.textSupport};
	margin: 0 0 0 ${(0,a.Q)(e.spacing[100])};
`}
`,y=r.default.div`
	${({theme:e})=>r.css`
	display: flex;
	align-items: center;
	flex-direction: column;
	padding-bottom: ${(0,a.Q)(e.spacing[400])};
	padding-top: ${(0,a.Q)(e.spacing[300])};
`}
`,w=r.keyframes`
  0% {
    transform: rotate(0deg)
  }
  100% {
    transform: rotate(360deg)
  }
`,x=(0,r.default)(i.ZP).attrs((()=>({type:"illustrative",variant:"loading",size:"xl"})))`
	${()=>r.css`
	animation: ${w} 1s infinite;
`}
`,O=(0,r.default)(l.Co).attrs((()=>({variant:"component-subtitle"})))`
	${({theme:e})=>r.css`
	margin: ${(0,a.Q)(e.spacing[300])} ${(0,a.Q)(e.spacing[400])};
	color: ${e.colors.base.textTitles};
`}
`;var k=o(82510);const E=(0,r.default)(k.ZP)`
	${()=>r.css`
	// @NOTE: Make selector more specific due to implementation in @anwb/input/styles/input.styled.ts:inputContainerStyles
	&& {
		border: 0;
	}
`}
`,Q=r.default.div`
	${({theme:e})=>r.css`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: ${e.colors.dark.overlayPopover};
`}
`,P=r.default.div`
	${({theme:e,$isBackdropVisible:t})=>r.css`
	${t&&r.css`
		z-index: ${e.zIndex.popUp};
	`}
`}
`,C=r.default.div`
	${({theme:e,$hideBoxShadow:t})=>r.css`
	position: relative;
	height: 100%;
	border-radius: ${(0,a.Q)(e.borderRadius.s)};
	background: ${e.colors.blanc.bgFormField};

	${!t&&r.css`
		box-shadow: ${(0,a.Q)(e.boxShadow.popover.x)} ${(0,a.Q)(e.boxShadow.popover.y)}
			${(0,a.Q)(e.boxShadow.popover.blur)} ${(0,a.Q)(e.boxShadow.popover.spread)}
			${e.boxShadow.popover.color};
	`}
`}
`,N=r.default.div`
	${({theme:e})=>r.css`
	display: flex;
	align-items: center;
	padding: ${(0,a.Q)(e.spacing[100])} ${(0,a.Q)(e.spacing[400])};
`}
`,B=(0,r.default)(i.ZP)`
	cursor: pointer;
`,S=r.default.div`
	${({theme:e})=>r.css`
	height: 100%;
	display: flex;
	flex-direction: column;
	padding-bottom: ${(0,a.Q)(e.spacing[100])};
`}
`,H=r.default.hr`
	${({theme:e})=>r.css`
	margin: 0 ${(0,a.Q)(e.spacing[400])} ${(0,a.Q)(e.spacing[300])}
		${(0,a.Q)(e.spacing[400])};
	border-top: ${(0,a.Q)(e.borderWidth[2])} solid ${e.colors.light.divider};
`}
`,I=({inputValue:e,reference:t,placeholder:o="Ik ben op zoek naar...",hideBoxShadow:r=!1,showResultPanel:i,enableBackdrop:a=!1,onLeftArrowIconClick:l,onRightArrowIconClick:c,onClearIconClick:s,onBackdropClick:d,onChange:u,onBlur:m,onFocus:g,onKeyUp:p,onKeyDown:b,autoFocus:v,children:f})=>{const $=(0,n.useRef)(null),h=a&&i;return n.createElement(P,{$isBackdropVisible:h},h&&n.createElement(Q,{onClick:d}),n.createElement(C,{$hideBoxShadow:r},n.createElement(N,null,i?n.createElement(B,{size:"xl","data-test":"chevron-left-icon",variant:"chevron-left",onClick:l}):n.createElement(B,{size:"xl","data-test":"search-icon",variant:"search",onClick:()=>{var e;null===(e=$.current)||void 0===e||e.focus()}}),n.createElement(E,{inputRef:$,value:e,onChange:u,$visible:i,reference:t,placeholder:o,onBlur:m,onFocus:g,onKeyUp:p,onKeyDown:b,autoFocus:v}),e&&i?n.createElement(B,{size:"xl","data-test":"cross-icon",variant:"cross",onClick:s}):n.createElement(B,{size:"xl","data-test":"arrow-right",variant:"arrow-right",onClick:c})),i&&n.createElement(S,null,n.createElement(H,null),f)))};I.Title=O,I.Item=({id:e,value:t,highlightValue:o,icon:r="arrow-up-right",showCross:i=!1,hideUnderline:a=!1,titleCase:l=!1,onClick:p=(()=>{}),onCrossClick:b=(()=>{})})=>{const v=(f=t,($=o||"")?f.split($).map(((e,t)=>{const o=`${e}-${t}`;return 0===t?n.createElement("strong",{key:o},e):n.createElement(n.Fragment,{key:o},$,n.createElement("strong",null,e))})):f);var f,$;return n.createElement(c,{onClick:t=>{t.target.getAttribute("itemref")===g?b(e):p(e)},key:e},n.createElement(s,{$hideUnderline:a},n.createElement(d,{variant:r,size:"md"}),n.createElement(m,{$titleCase:l},v),i&&n.createElement(u,null,n.createElement(d,{itemRef:g,variant:"cross",size:"sm",$showHoverEffect:!0}))))},I.Link=({id:e,label:t,icon:o="search",suffixLabel:r,count:i,onClick:a=(()=>{})})=>{const l=void 0!==i,c=(0,p.Vj)(i);return n.createElement(b,{key:e},n.createElement(v,{variant:o,size:"sm"}),n.createElement(f,{onClick:()=>a()},n.createElement($,null,t,"\xa0",n.createElement("strong",null,r))),l&&n.createElement(h,null,"(",c,")"))},I.LoadingIndicator=()=>n.createElement(y,null,n.createElement(x,null));var j=I},90676:function(e,t,o){o.d(t,{Z:function(){return y}});var n=o(29901),r=o(87608),i=o.n(r),a=o(54394),l=o(20819),c=o(88372),s=o(46439),d=o(6189),u=o(51035),m=o(99374);const g=(0,l.default)(m.Co).attrs({variant:"tag-text"})`
	${({theme:e,$clickable:t,$removable:o})=>l.css`
	display: inline-flex;
	align-items: center;
	height: ${(0,d.Q)(34)};
	border-radius: ${e.name===u.G.name?(0,d.Q)(e.borderRadius.m):(0,d.Q)(e.borderRadius.rounded)};

	background-color: ${e.colors.extralight.bgTag};
	text-decoration: none;
	white-space: nowrap;

	${t&&l.css`
		cursor: pointer;

		&:focus,
		&:hover {
			color: ${e.colors.highlight.textHover};
			background-color: ${e.colors.light.bgTagHover};
		}

		&:active {
			color: ${e.name===u.G.name?e.colors.action.textActive:e.colors.blanc.textInverse};
			background-color: ${e.colors.base.bgTagActive};

			${b} {
				color: ${e.name===u.G.name?e.colors.action.textActive:e.colors.blanc.iconInteractiveInverse};
			}
		}
	`}

	${o&&l.css`
		overflow: hidden;
		max-width: ${(0,d.Q)(450)};
		transition: max-width 0.3s ease-out;
	`}

    ${s.eg} {
		display: flex;
		align-items: center;
		margin: 0;
	}
`}
`,p=l.default.span`
	${({theme:e})=>l.css`
	display: inline-flex;
	align-items: center;
	gap: ${(0,d.Q)(e.spacing[100])};
	padding: ${e.name===u.G.name?`${(0,d.Q)(e.spacing[100])} ${(0,d.Q)(e.spacing[200])}`:`${(0,d.Q)(e.spacing[200])} ${(0,d.Q)(e.spacing[300])}`};

	&:focus {
		outline: none;
	}
`}
`,b=(0,l.default)(c.Z)`
	${()=>l.css`
	display: flex;
	align-items: center;
	padding: 0;
`}
`;var v=function(e,t){var o={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(o[n]=e[n]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var r=0;for(n=Object.getOwnPropertySymbols(e);r<n.length;r++)t.indexOf(n[r])<0&&Object.prototype.propertyIsEnumerable.call(e,n[r])&&(o[n[r]]=e[n[r]])}return o};const f=e=>{var{children:t,loading:o,url:r,removable:l,onTagRemove:c,selectable:s,isSelected:d,onSelect:u}=e,m=v(e,["children","loading","url","removable","onTagRemove","selectable","isSelected","onSelect"]);const f=()=>{s&&u&&u(t)},$=e=>{l&&c&&c(t,e)},h=r?"a":"span",y=i()("PONCHO-tag",{"PONCHO-tag--clickable":r||l,"PONCHO-tag--removable":l,"PONCHO-tag--selected":d,"PONCHO-tag--selectable":s});return l?n.createElement(g,Object.assign({tagName:h},m,{className:y,onClick:e=>$(e),onKeyDown:e=>"Enter"===e.key&&$(e),role:"button",tabIndex:0,$clickable:r||l,$removable:l}),n.createElement(p,{className:"PONCHO-tag__inner",tabIndex:-1},t,n.createElement(b,{icon:"cross",size:"xs"}))):s?n.createElement(g,Object.assign({tagName:"span",className:y,role:"button",tabIndex:0,onClick:()=>f(),onKeyDown:({key:e})=>"Enter"===e&&f()},m),n.createElement(p,{className:"PONCHO-tag__inner",tabIndex:-1},t)):n.createElement(g,Object.assign({variant:"tag-text",tagName:h},m,{className:y,href:r,$clickable:!!r}),n.createElement(p,{className:"PONCHO-tag__inner"},o?n.createElement(a.ZP,{inline:!0,size:"small"}):t))};f.defaultProps={isSelected:!1,onSelect:()=>{}};var $=f,h=o(64852);var y=({items:e,removable:t,onTagRemove:o,selectable:r,onSelect:i})=>n.createElement(h.r,{className:"PONCHO-tags"},e.map((({text:e,url:a})=>n.createElement($,{key:e,url:a,removable:t,onTagRemove:o,selectable:r,onSelect:i},e))))},64852:function(e,t,o){o.d(t,{r:function(){return i}});var n=o(20819),r=o(6189);const i=n.default.div`
	${({theme:e})=>n.css`
	display: flex;
	flex-wrap: wrap;
	gap: ${(0,r.Q)(e.spacing[200])};
	width: auto;
	margin: ${(0,r.Q)(e.spacing[300])} 0;
`}
`},22310:function(e,t,o){o.d(t,{d:function(){return r}});var n=o(70407);const r=Object.assign({name:"ANWB brand refresh"},n.N)},35274:function(e,t,o){o.d(t,{Qp:function(){return v},tP:function(){return f}});var n=!1;if("undefined"!==typeof window){var r={get passive(){n=!0}};window.addEventListener("testPassive",null,r),window.removeEventListener("testPassive",null,r)}var i="undefined"!==typeof window&&window.navigator&&window.navigator.platform&&(/iP(ad|hone|od)/.test(window.navigator.platform)||"MacIntel"===window.navigator.platform&&window.navigator.maxTouchPoints>1),a=[],l=!1,c=-1,s=void 0,d=void 0,u=void 0,m=function(e){return a.some((function(t){return!(!t.options.allowTouchMove||!t.options.allowTouchMove(e))}))},g=function(e){var t=e||window.event;return!!m(t.target)||(t.touches.length>1||(t.preventDefault&&t.preventDefault(),!1))},p=function(){void 0!==u&&(document.body.style.paddingRight=u,u=void 0),void 0!==s&&(document.body.style.overflow=s,s=void 0)},b=function(){if(void 0!==d){var e=-parseInt(document.body.style.top,10),t=-parseInt(document.body.style.left,10);document.body.style.position=d.position,document.body.style.top=d.top,document.body.style.left=d.left,window.scrollTo(t,e),d=void 0}},v=function(e,t){if(e){if(!a.some((function(t){return t.targetElement===e}))){var o={targetElement:e,options:t||{}};a=[].concat(function(e){if(Array.isArray(e)){for(var t=0,o=Array(e.length);t<e.length;t++)o[t]=e[t];return o}return Array.from(e)}(a),[o]),i?window.requestAnimationFrame((function(){if(void 0===d){d={position:document.body.style.position,top:document.body.style.top,left:document.body.style.left};var e=window,t=e.scrollY,o=e.scrollX,n=e.innerHeight;document.body.style.position="fixed",document.body.style.top=-t,document.body.style.left=-o,setTimeout((function(){return window.requestAnimationFrame((function(){var e=n-window.innerHeight;e&&t>=n&&(document.body.style.top=-(t+e))}))}),300)}})):function(e){if(void 0===u){var t=!!e&&!0===e.reserveScrollBarGap,o=window.innerWidth-document.documentElement.clientWidth;if(t&&o>0){var n=parseInt(window.getComputedStyle(document.body).getPropertyValue("padding-right"),10);u=document.body.style.paddingRight,document.body.style.paddingRight=n+o+"px"}}void 0===s&&(s=document.body.style.overflow,document.body.style.overflow="hidden")}(t),i&&(e.ontouchstart=function(e){1===e.targetTouches.length&&(c=e.targetTouches[0].clientY)},e.ontouchmove=function(t){1===t.targetTouches.length&&function(e,t){var o=e.targetTouches[0].clientY-c;!m(e.target)&&(t&&0===t.scrollTop&&o>0||function(e){return!!e&&e.scrollHeight-e.scrollTop<=e.clientHeight}(t)&&o<0?g(e):e.stopPropagation())}(t,e)},l||(document.addEventListener("touchmove",g,n?{passive:!1}:void 0),l=!0))}}else console.error("disableBodyScroll unsuccessful - targetElement must be provided when calling disableBodyScroll on IOS devices.")},f=function(){i&&(a.forEach((function(e){e.targetElement.ontouchstart=null,e.targetElement.ontouchmove=null})),l&&(document.removeEventListener("touchmove",g,n?{passive:!1}:void 0),l=!1),c=-1),i?b():p(),a=[]}},82510:function(e,t,o){o.d(t,{ZP:function(){return c}});var n=o(29901),r=o(87608),i=o.n(r),a=o(44680),l=function(e,t){var o={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(o[n]=e[n]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var r=0;for(n=Object.getOwnPropertySymbols(e);r<n.length;r++)t.indexOf(n[r])<0&&Object.prototype.propertyIsEnumerable.call(e,n[r])&&(o[n[r]]=e[n[r]])}return o},c=function(e){var t=e.reference,o=e.name,r=e.type,c=e.placeholder,s=e.required,d=void 0!==s&&s,u=e.disabled,m=void 0!==u&&u,g=e.readonly,p=e.pattern,b=e.valid,v=e.loading,f=e.inputRef,$=e.className,h=e.variant,y=void 0===h?"field-text":h,w=l(e,["reference","name","type","placeholder","required","disabled","readonly","pattern","valid","loading","inputRef","className","variant"]),x=i()("PONCHO-input",{"PONCHO-input--loading":v,"PONCHO-input--valid":!0===b,"PONCHO-input--invalid":!1===b,"PONCHO-input--readonly":m||g},$);return(0,n.useEffect)((function(){0}),[]),n.createElement(n.Fragment,null,n.createElement(a.SP,null,n.createElement(a.fv,Object.assign({variant:y,type:r,id:t,name:o,placeholder:c,required:d,disabled:m,pattern:p,"aria-required":d,"aria-disabled":m,"aria-invalid":!1===b||void 0,"data-hj-suppress":!0,inputRef:f},w,{className:x,$invalid:!1===b,$loading:v})),v&&n.createElement(a.Gn,null)))}}}]);