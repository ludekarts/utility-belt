function e(e){var t={"ą":"a","ć":"c","ę":"e","ł":"l","ń":"n","ó":"o","ś":"s","ż":"z","ź":"z"," ":"-"};return e.toLowerCase().replace(/[\Wąćęłńóśżź_ ]/g,function(e){return t[e]||""}).replace(/-{2,}/,"-")}function t(e){return!!e&&"symbol"!=typeof e&&"string"!=typeof e&&"number"!=typeof e&&"boolean"!=typeof e&&!Array.isArray(e)}function n(e,t){for(var n=e[0],r=e[1],o=!1,i=0,a=t.length-1;i<t.length;a=i++){var u=t[i][0],c=t[i][1],f=t[a][1];c>r!=f>r&&n<(t[a][0]-u)*(r-c)/(f-c)+u&&(o=!o)}return o}function r(e){var t=[2,3,4],n=[11,12,13,14];return function(r){return 1===r?e.one:!t.includes(r%10)||n.includes(r)?e.multiple:e.couple}}function o(e,t){return Math.floor(Math.random()*(t-e+1))+e}function i(){return(+new Date+100*Math.random()).toString(32)}function a(e){document.head.appendChild(document.createElement("style")).textContent=e}function u(e,t){var n=t.length,r=e.length;if(r>n)return!1;if(r===n)return e===t;e:for(var o=0,i=0;o<r;o++){for(var a=e.charCodeAt(o);i<n;)if(t.charCodeAt(i++)===a)continue e;return!1}return!0}function c(e,t){return s(t)?void 0===t?e:t:Array.isArray(t)||Array.isArray(e)?l(e,t):f(e,t)}function f(e,t){if(void 0===e)return t;if(void 0===t)return e;if(null===e)return t;if(null===t)return t;var n=Object.keys(t),r=Object.keys(e),o=n.concat(r.filter(function(e){return!n.includes(e)}));return o.length?o.reduce(function(n,r){var o=t[r],i=e[r];return n[r]=s(o)?void 0===o?i:o:Array.isArray(i)||Array.isArray(o)?l(i,o):o instanceof RegExp?RegExp(o.source,o.flags):f(i,o),n},{}):e}function l(e,t){if(Array.isArray(e)&&Array.isArray(t)){for(var n=e.length,r=t.length,o=[],i=0;i<n||i<r;i++)o[i]=s(t[i])?void 0===t[i]?e[i]:t[i]:Array.isArray(e[i])||Array.isArray(t[i])?l(e[i],t[i]):f(e[i],t[i]);return o}return t}function s(e){return["string","number","boolean","symbol","function","undefined"].includes(typeof e)}function d(e){var t={},n=function(e){return function(n){if(n.target.dataset[e]){var r=t[n.target.dataset[e]];r&&r(n)}}};[].slice.call(arguments,1).forEach(function(t){e.addEventListener(t,n(t))});var r=function(e,n){t[e]||(t[e]=n)},o=function(e,n){t[e](n)};return Object.freeze({add:r,callHandler:o})}function p(e){var t,n=0,r=new Array(e);return Object.freeze({push:function(o){o&&(r[n]=o,t=r[n],n=(n+1)%e)},pull:function(){return t=r[n=(n-1+e)%e],r[n]=void 0,t},get:function(e){return r[e]},head:function(){return t},dump:function(){return r}})}function v(){var e=document.getElementById("_clipContainer_")||document.createElement("textarea");return e.id||(e.id="_clipContainer_",e.style.opacity=0,e.style.position="fixed",e.style.pointerEvents="none",document.body.appendChild(e)),function(t){try{return e.value=t,e.select(),document.execCommand("copy"),t}catch(e){return void console.error(e)}}}function h(e,t){return e.reduce(function(e,n){return e[n[t]]=n,e},{})}function y(e,t){for(var n=0,r=e.length,o=[];n<r;n+=t)o.push(e.slice(n,n+t));return o}function m(e,t){return{added:t.filter(function(t){return!~e.indexOf(t)}),removed:e.filter(function(e){return!~t.indexOf(e)})}}function g(e,t){for(var n,r,o=e.slice(0),i=e.length,a=i-t;i-- >a;)n=o[r=Math.floor((i+1)*Math.random())],o[r]=o[i],o[i]=n;return o.slice(a)}function b(e){for(var t=[],n=-1,r=e.length;++n!==r;t[n]=e[n]);return t}function A(e,t,n){for(var r=-1,o=e.length,i=o-1;++r<o;)n=t(n,e[r],r,r===i);return n}function x(e,t){for(var n=0,r=e.length;n<r;)t(e[n],n,e),n++}function w(e,t){for(var n=-1,r=[],o=e.length;++n<o;)!t(e[n],n)&&r.push(e[n]);return r}function C(e){for(var t,n,r=e.length;0!==r;)n=Math.floor(Math.random()*r),t=e[r-=1],e[r]=e[n],e[n]=t;return e}function E(e,t,n){void 0===n&&(n=function(e){return e});var r=t.toLowerCase();return e.sort(function(e,t){var o=n(e).indexOf(r),i=n(t).indexOf(r);return(o<0?Infinity:o)-(i<0?Infinity:i)})}function O(e,t){return e.toLowerCase().includes(t.toLowerCase())}function L(e){var t=e.extractContent,n=e.uiRender,r=e.matchFn,o=void 0===r?O:r,i=e.matchIfEmptyPhrase,u=void 0===i||i,c=b(document.querySelectorAll(e.selector)).reduce(function(e,n){return!u&&n.classList.add("dom-filter-match"),e.push({text:t?t(n,index):n.textContent,ref:n}),e},[]);a("\n    .dom-filter-match {\n      display: none;\n    }\n  ");var f={},l=c.length;return function(e){for(var t=0;t<l;t++){var r=c[t];(e.length||u)&&o(r.text,e,c)?(r.ref.classList.remove("dom-filter-match"),n&&n(r,e,f)):r.ref.classList.add("dom-filter-match")}return c}}function j(e,t,n,r){return void 0===r&&(r=!1),e.addEventListener(t,n,r),function(){return e.removeEventListener(t,n,r)}}function k(){return(k=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}function M(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var N=new Map;function S(e,t){void 0===t&&(t={});var n=t.fallback,r=t.freepass,o=void 0!==r&&r,i=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)t.indexOf(n=i[r])>=0||(o[n]=e[n]);return o}(t,["fallback","freepass"]),a=new AbortController,u=a.signal,c=fetch(e,k(k({},i),{},{signal:u})).then(function(e){return N.delete(c),e}).then(function(e,t){return function(n){if(n.ok||t)return n;if(e)return console.warn("Request rejected: "+n.statusText+". Fallback applied"),e;throw function(e){var t=Error();return t.code=e.status,t.message=e.statusText,t}(n)}}(n,o));return N.set(c,function(){a.abort()}),c}function I(e){if(e instanceof FormData)return{body:e};if(t(e)){var n=new FormData;return Object.keys(e).forEach(function(t){return n.append(t,JSON.stringify(e[t]))}),n}return e}function T(e){N.has(e)&&(N.get(e)(),N.delete(e))}function R(e){var t=e.headers.get("content-type").split(";")[0];if(/^text\//.test(t))return e.text();if(/^image\//.test(t))return e.blob();switch(t){case"application/json":return e.json();case"multipart/form-data":return e.formData();default:return console.warn("Not recognized content-type: "+e.headers.get("content-type")),e}}var _={isNull:function(e){return null===e},isUndefined:function(e){return void 0===e},object:function(e){return t(e)},array:function(e){return Array.isArray(e)},number:function(e){return"number"==typeof e},string:function(e){return"string"==typeof e},symbol:function(e){return"symbol"==typeof e},boolean:function(e){return"boolean"==typeof e},matches:function(e){return function(t){return e.test(t)}},objectOf:function(e){return function(n){return t(n)&&{value:n,schema:e}}},arrayOf:function(e){return function(t){return Array.isArray(t)&&{value:t,schema:e}}}};function H(e,n,r){if(void 0===r&&(r={}),"function"==typeof n){var o=n(e);if(Array.isArray(o.value))return o.value.every(function(e){return Array.isArray(o.schema)?o.schema.some(function(t){return H(e,t,{silent:!0})}):H(e,o.schema)});if(t(o.schema))return Object.keys(o.schema).every(function(e){if(void 0===o.value[e])throw new Error('Missing property "'+e+'"');return H(o.value[e],o.schema[e])});if(!1===o){if(r.silent)return!1;throw new Error('Value "'+e+'" does not match schema type.')}return!0}throw new Error('Incorrect schema type. Got "'+typeof n+'" instead of ptop-type function.')}function q(e){return e&&e.length?(0===e.indexOf("?")?e.slice(1):e).split("&").reduce(function(e,t){var n=t.split("="),r=n[0],o=decodeURIComponent(n[1]);return e[r]?Array.isArray(e[r])?e[r].push(o):e[r]=[e[r],o]:e[r]=o,e},{}):{}}function F(e,t){var n="string"==typeof e?q(e):e,r=new URLSearchParams,o=k(k({},n),t);return Object.keys(o).forEach(function(e){var t=o[e];void 0!==t&&(Array.isArray(t)?t.forEach(function(t){return r.append(e,t)}):("string"!=typeof t||t.length>0)&&r.append(e,t))}),r.toString()}function z(e,t){if(!t.length)return e;for(var n,r=[],o=function(e){var t=e.split(","),n=t.length>1?t.reduce(function(e,t){var n=t.trim();return n.length?""+e+n+"|":e},""):t[0]+"|";return new RegExp(n.slice(0,-1),"gi")}(t);n=o.exec(e);)r.push([n.index,n.index+n[0].length]);return r.reverse().reduce(function(e,t){var n=t[0],r=t[1];return e.slice(0,n)+"<strong>"+e.slice(n,r)+"</strong>"+e.slice(r)},e)}function B(e,t,n){var r;return function(){var o=[].slice.call(arguments),i=function(){r=null,!n&&e.apply(void 0,o)};clearTimeout(r),r=setTimeout(i,t),n&&!r&&e.apply(void 0,o)}}function D(e,t,n){var r,o=this;return function(){var i=[].slice.call(arguments),a=o;return new Promise(function(o){var u=n&&!r;clearTimeout(r),r=setTimeout(function(){r=null,n||o(e.apply(a,i))},t),u&&o(e.apply(a,i))})}}var P=function(e,t){var n,r=0;return function(){(n=new Date)-r<=t&&(e.apply(void 0,[].slice.call(arguments)),n=0),r=n}};function U(e,t,n){void 0===n&&(n=[]),Array.from(e.attributes||[]).forEach(function(e){return!~n.indexOf(e.name)&&t.setAttribute(e.name,e.value)})}function $(e){if(0===e.childNodes.length)return e.remove();e.parentNode.insertBefore(e.firstChild,e),$(e)}function G(e,t){var n=t.nextSibling,r=t.parentNode;return n?r.insertBefore(e,n):r.appendChild(e),e}function J(e,t){t.parentNode.insertBefore(e,t)}function V(e,t){for(;e.childNodes.length>0;)t.appendChild(e.firstChild);return t}function W(e,t){return[e.slice(0,t),e.slice(t)]}function K(e,t,n){return e.slice(0,n)+t+e.slice(n+t.length-1,e.length)}var Q,X=(Q=new Map,{get:function(e){return void 0===e&&function(){for(var e,t=function(e){var t=0;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=function(e,t){if(e){if("string"==typeof e)return M(e,void 0);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?M(e,void 0):void 0}}(e)))return function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}};throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}return(t=e[Symbol.iterator]()).next.bind(t)}(Q.entries());!(e=t()).done;){var n=e.value,r=n[0],o=n[1];o&&!document.body.contains(o)&&Q.delete(r)}}(),Q.get(e)},set:function(e,t){Q.set(e,t)}}),Y=X.get;function Z(){var e,t=new Map,n=function(t){return e=t};return function(r){return Array.isArray(r)&&r.raw?(e||(e=r),t.has("#_initial_0")||t.set("#_initial_0",ee(e,n)),t.get("#_initial_0").apply(void 0,[e].concat([].slice.call(arguments,1)))):"string"==typeof r||"number"==typeof r?(t.has(r)||t.set(r,ee(e,n)),t.get(r)):void 0}}function ee(e,t){var n,r=[],o=document.createElement("div");return function(i){var a=[].slice.call(arguments,1);if(!Array.isArray(i)||!i.raw)throw new Error("createInstance error");if(e||(e=t(i)),r.length)x(a,function(e,t){e!==r[t].value&&re(r[t],e)});else{var u=e.reduce(function(e,t,n){var o=a[n],i=e+=t,u={value:o,index:n};if(te(i)){var c=i.lastIndexOf("<"),f=i.slice(0,c),l=i.slice(c);if(i=l.includes("data-hook")?f+l.replace(/data-hook="(.+?)"/,function(e,t){return'data-hook="'+t+" "+n+'"'}):f+K(l,' data-hook="'+n+'"',l.indexOf(" ")),/ \?.+="$/.test(l)){var s=i.lastIndexOf("?");u.bool=i.slice(s+1,i.lastIndexOf("=")),i=i.slice(0,s)+i.slice(s+1),o=""}else o="%#"+n+"#%"}else o instanceof HTMLElement?o='<i data-hook="'+n+'" data-hte="true"></i>':Array.isArray(o)?o='<i data-hook="'+n+'" data-lst="true"></i>':ne(o)&&(o='<i data-hook="'+n+'" data-ref="true"></i>');return r.push(u),i+(o||"")},"");o.insertAdjacentHTML("beforeend",u),x(b(o.querySelectorAll("[data-hook]")),function(e){x(e.dataset.hook.split(" "),function(t){var n=r[t];if(e.dataset.ref)n.type="text",n.ref=document.createTextNode(n.value),e.parentNode.replaceChild(n.ref,e);else if(e.dataset.hte)n.type="node",e.parentNode.replaceChild(n.value,e);else if(e.dataset.lst){var o=e.parentNode;n.type="list",n.parent=o,x(n.value,function(t){t instanceof HTMLElement&&o.insertBefore(t,e)}),e.remove()}else if(n.ref=e,n.type="attribute",n.bool)n.value?e.setAttribute(n.bool,n.bool):e.removeAttribute(n.bool);else{var i=oe(t,e);n.attribute=i,e.setAttribute(i.name,i.template.replace(new RegExp("%#"+t+"#%"),n.value))}e.removeAttribute("data-hook")})}),x(b(o.querySelectorAll("[ref]")),function(e){X.set(e.getAttribute("ref"),e),e.removeAttribute("ref")}),n=ie(o)}return n}}function te(e){return e.lastIndexOf("<")>e.lastIndexOf(">")}function ne(e){return e&&("number"==typeof e||"string"==typeof e)}function re(e,t){if(e){if("attribute"===e.type)e.bool?t?e.ref.setAttribute(e.bool,e.bool):e.ref.removeAttribute(e.bool):e.ref.setAttribute(e.attribute.name,e.attribute.template.replace(new RegExp("%#"+e.index+"#%"),t));else if("text"===e.type)e.ref.textContent=t;else if("node"===e.type)e.value.parentNode.replaceChild(t,e.value),e.value=t;else if("list"===e.type&&Array.isArray(t)){var n=[];x(e.value,function(e){t.includes(e)?n.push(e):e.remove()}),e.value=n,x(t,function(t,n){var r=e.value[n];r!==t&&(void 0===r?e.value[n-1]?e.value[n]=G(t,e.value[n-1]):e.parent.appendChild(t):r.parentNode.replaceChild(t,r))})}e.value=t}}function oe(e,t){var n=Array.prototype.slice.call(t.attributes).find(function(t){return new RegExp("%#"+e+"#%").test(t.value)});return{name:n.name,template:n.value}}function ie(e){return 1===e.children.length?e.children[0]:e}function ae(e){return document.createRange().createContextualFragment(e)}function ue(e){if(!e)throw new Error("getNodesPath error: stopSelector is required");return function t(n,r){return void 0===r&&(r=[n]),n.parentNode.matches(e)?r:(r.push(n.parentNode),t(n.parentNode,r))}}function ce(e){var t=document.querySelector("*[data-import]");if(!t)return e&&e();var n=t.dataset.import;t.removeAttribute("data-import"),fetch(n).then(function(e){if(e.ok)return e.text();throw Error("Cannot import file: "+n)}).then(function(r){t.innerHTML=r,t.dispatchEvent(new CustomEvent("htmlLoaded",{bubbles:!0,detail:{file:n}})),ce(e)}).catch(function(n){t.innerHTML='<strong style="color:red;">Cannot import module!</strong>',console.error(n),ce(e)})}function fe(e,t,n){return void 0===n&&(n=!1),e&&e.classList.add(t),function(r){return n&&e&&e===r?e.classList.toggle(t):(e&&e.classList.remove(t),r&&r.classList.add(t),e=r),e}}function le(e,t){var n=e.match(/[\w-:]+=".+?"/g);n&&(n=n.map(function(e){return function(e,t){return[e.substring(0,t),e.substring(t+1)]}(e.replace(/"/g,""),e.indexOf("="))}));var r,o=~e.indexOf("[")?e.slice(0,e.indexOf("[")):e,i=~o.indexOf(".")?o.split("."):[o],a=i[0];if(i.length>0&&(i=i.slice(1,i.length).join(" ")),~a.indexOf("#")){var u=a.split("#");a=u[0],r=u[1]}var c=document.createElement(a);return r&&(c.id=r),t&&("string"==typeof t?c.innerHTML=t:t instanceof HTMLElement&&c.appendChild(t)),n&&n.forEach(function(e){return c.setAttribute(e[0],e[1])}),i&&(c.className=i),c}function se(e,t){var n=t.isModule,r=t.onComplete,o=document.createElement("script");o.setAttribute("type",n?"module":"text/javascript"),r&&o.addEventListener("load",function e(){o.removeEventListener("load",e),r()}),o.setAttribute("src",e),document.head.appendChild(o)}function de(e){return btoa(encodeURIComponent(e).replace(/%([0-9A-F]{2})/g,function(e,t){return String.fromCharCode("0x"+t)}))}function pe(e){return e.split("").reduce(function(e,t){return(e=(e<<5)-e+t.charCodeAt(0))&e},0)}export{T as abort,h as arrayToObject,a as attachStyle,de as base64,H as checkSchema,y as chunksArray,v as clipboard,m as compareArrays,U as copyAttrs,le as createElement,j as createEventHandler,Z as createTemplate,B as debounce,D as debouncePromise,c as deepOverride,L as domFilter,ae as elFromString,d as events,$ as extractNodes,u as fuzzySearch,ue as getNodesPath,g as getRandomSubarray,Y as getRef,pe as hashCode,z as highlight,e as hyphenate,ce as importHtml,P as inDeltaTime,n as inPolygon,se as includeScriptTag,G as insertNodeAfter,J as insertNodeBefore,t as isObject,x as loop,p as loopstack,fe as memoElement,V as moveNodes,b as nodeListToArray,I as objectToFetchBody,R as parseResponse,r as plWordCase,K as placeStrBetween,q as queryToObject,o as rangeRandomInt,A as reduce,w as removeFromArray,S as request,_ as schemaTypes,C as shuffleArray,E as sortByPhraseIndex,W as splitAtIndex,i as uid,F as updateQuery};