function e(e){var t={"ą":"a","ć":"c","ę":"e","ł":"l","ń":"n","ó":"o","ś":"s","ż":"z","ź":"z"," ":"-"};return e.toLowerCase().replace(/[\Wąćęłńóśżź_ ]/g,function(e){return t[e]||""}).replace(/-{2,}/,"-")}function t(e){return!!e&&"symbol"!=typeof e&&"string"!=typeof e&&"number"!=typeof e&&"boolean"!=typeof e&&!Array.isArray(e)}function r(e,t){for(var r=e[0],n=e[1],o=!1,a=0,i=t.length-1;a<t.length;i=a++){var u=t[a][0],c=t[a][1],f=t[i][1];c>n!=f>n&&r<(t[i][0]-u)*(n-c)/(f-c)+u&&(o=!o)}return o}function n(e){var t=[2,3,4],r=[11,12,13,14];return function(n){return 1===n?e.one:!t.includes(n%10)||r.includes(n)?e.multiple:e.couple}}function o(e,t){return Math.floor(Math.random()*(t-e+1))+e}function a(){return([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,function(e){return(e^crypto.getRandomValues(new Uint8Array(1))[0]&15>>e/4).toString(16)})}function i(e,t){var r=t.length,n=e.length;if(n>r)return!1;if(n===r)return e===t;e:for(var o=0,a=0;o<n;o++){for(var i=e.charCodeAt(o);a<r;)if(t.charCodeAt(a++)===i)continue e;return!1}return!0}function u(e,t){return s(t)?void 0===t?e:t:Array.isArray(t)||Array.isArray(e)?f(e,t):c(e,t)}function c(e,t){if(void 0===e)return t;if(void 0===t)return e;if(null===e)return t;if(null===t)return t;var r=Object.keys(t),n=Object.keys(e),o=r.concat(n.filter(function(e){return!r.includes(e)}));return o.length?o.reduce(function(r,n){var o=t[n],a=e[n];return r[n]=s(o)?void 0===o?a:o:Array.isArray(a)||Array.isArray(o)?f(a,o):o instanceof RegExp?RegExp(o.source,o.flags):c(a,o),r},{}):e}function f(e,t){if(Array.isArray(e)&&Array.isArray(t)){for(var r=e.length,n=t.length,o=[],a=0;a<r||a<n;a++)o[a]=s(t[a])?void 0===t[a]?e[a]:t[a]:Array.isArray(e[a])||Array.isArray(t[a])?f(e[a],t[a]):c(e[a],t[a]);return o}return t}function s(e){return["string","number","boolean","symbol","function","undefined"].includes(typeof e)}function l(e){var t={},r=function(e){return function(r){if(r.target.dataset[e]){var n=t[r.target.dataset[e]];n&&n(r)}}};[].slice.call(arguments,1).forEach(function(t){e.addEventListener(t,r(t))});var n=function(e,r){t[e]||(t[e]=r)},o=function(e,r){t[e](r)};return Object.freeze({add:n,callHandler:o})}function d(e){var t,r=0,n=new Array(e);return Object.freeze({push:function(o){o&&(n[r]=o,t=n[r],r=(r+1)%e)},pull:function(){return t=n[r=(r-1+e)%e],n[r]=void 0,t},get:function(e){return n[e]},head:function(){return t},dump:function(){return n}})}function p(){var e=document.getElementById("_clipContainer_")||document.createElement("textarea");return e.id||(e.id="_clipContainer_",e.style.opacity=0,e.style.position="fixed",e.style.pointerEvents="none",document.body.appendChild(e)),function(t){try{return e.value=t,e.select(),document.execCommand("copy"),t}catch(e){return void console.error(e)}}}function v(e){return document.createRange().createContextualFragment(e)}function h(e){if(!e)throw new Error("getNodesPath error: stopSelector is required");return function t(r,n){return void 0===n&&(n=[r]),r.parentNode.matches(e)?n:(n.push(r.parentNode),t(r.parentNode,n))}}function m(e,t){var r=document.createElement("style");return t&&(r.dataset.styleName=t),document.head.appendChild(r).textContent=e,r}function y(e,t){return e.reduce(function(e,r){return e[r[t]]=r,e},{})}function g(e,t){for(var r=0,n=e.length,o=[];r<n;r+=t)o.push(e.slice(r,r+t));return o}function b(e,t){return{added:t.filter(function(t){return!~e.indexOf(t)}),removed:e.filter(function(e){return!~t.indexOf(e)})}}function A(e,t){for(var r,n,o=e.slice(0),a=e.length,i=a-t;a-- >i;)r=o[n=Math.floor((a+1)*Math.random())],o[n]=o[a],o[a]=r;return o.slice(i)}function x(e){for(var t=[],r=-1,n=e.length;++r!==n;t[r]=e[r]);return t}function w(e,t,r){for(var n=-1,o=e.length,a=o-1;++n<o;)r=t(r,e[n],n,n===a);return r}function E(e,t){for(var r=0,n=e.length;r<n;)t(e[r],r,e),r++}function C(e,t){for(var r=-1,n=[],o=e.length;++r<o;)!t(e[r],r)&&n.push(e[r]);return n}function O(e){for(var t,r,n=e.length;0!==n;)r=Math.floor(Math.random()*n),t=e[n-=1],e[n]=e[r],e[r]=t;return e}function N(e,t,r){void 0===r&&(r=function(e){return e});var n=t.toLowerCase();return e.sort(function(e,t){var o=r(e).indexOf(n),a=r(t).indexOf(n);return(o<0?Infinity:o)-(a<0?Infinity:a)})}function L(e,t){return e.toLowerCase().includes(t.toLowerCase())}function M(e){var t=e.extractContent,r=e.uiRender,n=e.matchFn,o=void 0===n?L:n,a=e.matchIfEmptyPhrase,i=void 0===a||a,u=x(document.querySelectorAll(e.selector)).reduce(function(e,r){return!i&&r.classList.add("dom-filter-match"),e.push({text:t?t(r,index):r.textContent,ref:r}),e},[]);m("\n    .dom-filter-match {\n      display: none;\n    }\n  ");var c={},f=u.length;return function(e){for(var t=0;t<f;t++){var n=u[t];(e.length||i)&&o(n.text,e,u)?(n.ref.classList.remove("dom-filter-match"),r&&r(n,e,c)):n.ref.classList.add("dom-filter-match")}return u}}function T(e,t,r,n){return void 0===n&&(n=!1),e.addEventListener(t,r,n),function(){return e.removeEventListener(t,r,n)}}function k(){return(k=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e}).apply(this,arguments)}var j=new Map;function R(e,t){void 0===t&&(t={});var r=t.fallback,n=t.freepass,o=void 0!==n&&n,a=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)t.indexOf(r=a[n])>=0||(o[r]=e[r]);return o}(t,["fallback","freepass"]),i=new AbortController,u=i.signal,c=fetch(e,k(k({},a),{},{signal:u})).then(function(e){return j.delete(c),e}).then(function(e,t){return function(r){if(r.ok||t)return r;if(e)return console.warn("Request rejected: "+r.statusText+". Fallback applied"),e;throw function(e){var t=Error(e.statusText&&e.statusText.length?e.statusText:"RequestError: Code "+e.status+". Response was not OK");return t.status=e.status,t}(r)}}(r,o));return j.set(c,function(){i.abort()}),c}function S(e){if(e instanceof FormData)return{body:e};if(t(e)){var r=new FormData;return Object.keys(e).forEach(function(t){return r.append(t,"string"==typeof(n=e[t])||"number"==typeof n||"boolean"==typeof n?e[t]:JSON.stringify(e[t]));var n}),r}return e}function I(e){j.has(e)&&(j.get(e)(),j.delete(e))}function H(e){var t=e.headers.get("content-type").split(";")[0];if(/^text\//.test(t))return e.text();if(/^image\//.test(t))return e.blob();switch(t){case"application/json":return e.json();case"multipart/form-data":return e.formData();default:return console.warn("Not recognized content-type: "+e.headers.get("content-type")),e}}var z={isNull:function(e){return null===e},isUndefined:function(e){return void 0===e},object:function(e){return t(e)},array:function(e){return Array.isArray(e)},number:function(e){return"number"==typeof e},string:function(e){return"string"==typeof e},symbol:function(e){return"symbol"==typeof e},boolean:function(e){return"boolean"==typeof e},matches:function(e){return function(t){return e.test(t)}},objectOf:function(e){return function(r){return t(r)&&{value:r,schema:e}}},arrayOf:function(e){return function(t){return Array.isArray(t)&&{value:t,schema:e}}}};function q(e,r,n){if(void 0===n&&(n={}),"function"==typeof r){var o=r(e);if(Array.isArray(o.value))return o.value.every(function(e){return Array.isArray(o.schema)?o.schema.some(function(t){return q(e,t,{silent:!0})}):q(e,o.schema)});if(t(o.schema))return Object.keys(o.schema).every(function(e){if(void 0===o.value[e])throw new Error('Missing property "'+e+'"');return q(o.value[e],o.schema[e])});if(!1===o){if(n.silent)return!1;throw new Error('Value "'+e+'" does not match schema type.')}return!0}throw new Error('Incorrect schema type. Got "'+typeof r+'" instead of ptop-type function.')}function B(e){return e&&e.length?(0===e.indexOf("?")?e.slice(1):e).split("&").reduce(function(e,t){var r=t.split("="),n=r[0],o=decodeURIComponent(r[1]);return e[n]?Array.isArray(e[n])?e[n].push(o):e[n]=[e[n],o]:e[n]=o,e},{}):{}}function P(e,t){var r="string"==typeof e?B(e):e,n=new URLSearchParams,o=k(k({},r),t);return Object.keys(o).forEach(function(e){var t=o[e];void 0!==t&&(Array.isArray(t)?t.forEach(function(t){return n.append(e,t)}):("string"!=typeof t||t.length>0)&&n.append(e,t))}),n.toString()}function F(e,t){if(!t.length)return e;for(var r,n=[],o=function(e){var t=e.split(","),r=t.length>1?t.reduce(function(e,t){var r=t.trim();return r.length?""+e+r+"|":e},""):t[0]+"|";return new RegExp(r.slice(0,-1),"gi")}(t);r=o.exec(e);)n.push([r.index,r.index+r[0].length]);return n.reverse().reduce(function(e,t){var r=t[0],n=t[1];return e.slice(0,r)+"<strong>"+e.slice(r,n)+"</strong>"+e.slice(n)},e)}function U(e){var t=new Map,r=e&&!0===e.debug,n="function"==typeof e.logger?e.logger:void 0;t.set("/",new Map);var o=Object.freeze({subscribe:function(e,r,a){var i=_(e,r,a),u=i.namespace,c=i.event,f=i.observer;t.has(u)||t.set(u,new Map);var s=t.get(u);return s.has(c)||s.set(c,[]),s.get(c).push(f),n&&n('A new subscription "'+c+'" was added to namespace "'+u+'".'),o},unsubscribe:function(e,r,n){var a=_(e,r,n),i=a.namespace,u=a.event,c=a.observer;if(t.has(i)){var f=t.get(i);if(f.has(u)){var s=f.get(u),l=s.indexOf(c);~l&&(s.splice(l,1),s.length?f.set(u,s):(f.delete(u),0===f.size&&"/"!==i&&t.delete(i)))}}return o},publish:function(e,r,a){var i=function(e,t,r){var n,o,a;return void 0===r?(n="/",o=e,a=t):(n=e,o=t,a=r),{namespace:n,event:o,message:a}}(e,r,a),u=i.namespace,c=i.event,f=i.message;if(t.has(u)){var s=t.get(u);if(s.has(c)){for(var l=s.get(c),d=l.length,p=0;p<d;p++)l[p](f,c);n&&n("published",{namespace:u,event:c,message:f,observersList:l})}}return o},getNamespace:function(e,n){if(void 0===n&&(n=!1),r)return n?("/"!==e&&t.delete(e),t):e?t.get(e):t}});return o}function _(e,t,r){var n,o,a;if(void 0===r?(n="/",o=e,a=t):(n=e,o=t,a=r),"string"!=typeof n)throw new Error("PubSub Error: namespace should be a string");if("string"!=typeof o)throw new Error("PubSub Error: subscribe event should be a string");if("function"!=typeof a)throw new Error("PubSub Error: the observer should be a function");return{namespace:n,event:o,observer:a}}function D(e,t,r){var n;return function(){var o=[].slice.call(arguments),a=function(){n=null,!r&&e.apply(void 0,o)};clearTimeout(n),n=setTimeout(a,t),r&&!n&&e.apply(void 0,o)}}var W=function(e,t){var r,n=0;return function(){(r=new Date)-n<=t&&(e.apply(void 0,[].slice.call(arguments)),r=0),n=r}};function V(e,t){var r,n=this,o=!1;return function(){o||(clearTimeout(r),e.apply(n,[].slice.call(arguments)),o=!0,r=setTimeout(function(){return o=!1},t))}}function G(e,t){return[e.slice(0,t),e.slice(t)]}function J(e,t,r){return""+e.slice(0,r)+t+e.slice(r,e.length)}function K(e,t,r){void 0===r&&(r=[]),Array.from(e.attributes||[]).forEach(function(e){return!~r.indexOf(e.name)&&t.setAttribute(e.name,e.value)})}function $(e){if(0===e.childNodes.length)return e.remove();e.parentNode.insertBefore(e.firstChild,e),$(e)}function Q(e,t){var r=t.nextSibling,n=t.parentNode;return r?n.insertBefore(e,r):n.appendChild(e),e}function X(e,t){t.parentNode.insertBefore(e,t)}function Y(e,t){for(;e.childNodes.length>0;)t.appendChild(e.firstChild);return t}var Z,ee=new Map,te=(Z=new Map,{get:function(e){if(!e instanceof HTMLElement)throw new Error("getRefs argument error: Helper expects HTMLElement as an argument.");return Z.get(e)||{}},set:function(e,t,r){var n=Z.get(e)||{};n[t]=r,Z.set(e,n)}}),re=te.get;function ne(e){var t=[].slice.call(arguments,1);if(Array.isArray(e)&&e.raw){var r=e.raw.join("-"),n=ee.get(r);return n?ae(n,t):oe(r,e,t)}if("string"==typeof e||"number"==typeof e){var o=e,a=ee.get(o);return function(e){var t=[].slice.call(arguments,1);if(Array.isArray(e)&&e.raw)return a?ae(a,t):oe(o,e,t);throw new Error("Template Error: Wrong function initailization.")}}throw new Error("Template Error: Wrong function initailization.")}function oe(e,t,r){var n=function(e,t){var r=[],n=document.createElement("div"),o=e.reduce(function(e,n,o){var a=t[o],i=e+=n,u={value:a,index:o};if(function(e){return e.lastIndexOf("<")>e.lastIndexOf(">")}(i)){var c=i.lastIndexOf("<"),f=i.slice(0,c),s=i.slice(c);if(i=s.includes("data-hook")?f+s.replace(/data-hook="(.+?)"/,function(e,t){return'data-hook="'+t+" "+o+'"'}):f+J(s,' data-hook="'+o+'"',s.indexOf(" ")),/ \?.+="$/.test(s)){var l=i.lastIndexOf("?");u.bool=i.slice(l+1,i.lastIndexOf("=")),i=i.slice(0,l)+i.slice(l+1),a=""}else a="%#"+o+"#%"}else a=ue(a)?'<i data-hook="'+o+'" data-hte="true"></i>':Array.isArray(a)?'<i data-hook="'+o+'" data-lst="true"></i>':ie(a)?'<i data-hook="'+o+'" data-ref="true"></i>':"";return r.push(u),i+(a||"")},"");n.insertAdjacentHTML("beforeend",o),E(x(n.querySelectorAll("[data-hook]")),function(e){E(e.dataset.hook.split(" "),function(t){var n=r[t];if(e.dataset.ref)n.type="text",n.ref=document.createTextNode(n.value),e.parentNode.replaceChild(n.ref,e);else if(e.dataset.hte)n.type="node",e.parentNode.replaceChild(n.value,e);else if(e.dataset.lst){var o=e.parentNode;n.type="list",n.parent=o,ce(n.value,e,o)}else if(n.ref=e,n.type="attribute",n.bool)n.value?e.setAttribute(n.bool,n.bool):e.removeAttribute(n.bool);else{if(!ie(n.value))throw new Error('Only String and Numbers can be passedt to the attributes, got: "'+typeof n.value+'" at "'+t+'" value.');var a=function(e,t){var r=Array.prototype.slice.call(t.attributes).find(function(t){return new RegExp("%#"+e+"#%").test(t.value)});return{name:r.name,template:r.value}}(t,e);n.attribute=a,e.setAttribute(a.name,a.template.replace(new RegExp("%#"+t+"#%"),n.value))}e.removeAttribute("data-hook")})});var a=function(e){return 1===e.children.length?e.children[0]:e}(n);return E(x(a.querySelectorAll("[ref]")),function(e){te.set(a,e.getAttribute("ref"),e),e.removeAttribute("ref")}),{element:a,elementsMap:r}}(t,r),o=n.element;return ee.set(e,{element:o,elementsMap:n.elementsMap}),o}function ae(e,t){var r=e.elementsMap;return E(t,function(e,t){e!==r[t].value&&function(e,t){if(e){if("attribute"===e.type)if(e.bool)t?e.ref.setAttribute(e.bool,e.bool):e.ref.removeAttribute(e.bool);else{if(!ie(t))throw new Error('Only String and Numbers can be passedt to the attributes, got: "'+typeof t+'" at "'+e.index+'" value.');e.ref.setAttribute(e.attribute.name,e.attribute.template.replace(new RegExp("%#"+e.index+"#%"),t))}else if("text"===e.type){if(ie(t))e.ref.textContent=t;else if(ue(t))e.type="node",e.ref.parentNode.replaceChild(t,e.ref);else if(Array.isArray(t)){var r=e.ref.parentNode;e.type="list",e.parent=r,ce(t,e.ref,r)}}else if("node"===e.type){if(ie(t)){var n=document.createTextNode(t);e.type="text",e.ref=n,e.value.parentNode.replaceChild(n,e.value)}else if(ue(t))e.value.parentNode.replaceChild(t,e.value);else if(Array.isArray(t)){var o=e.value.parentNode;e.type="list",e.parent=o,ce(t,e.value,o)}}else if("list"===e.type)if(ie(t)){var a=document.createTextNode(t);e.type="text",e.ref=a,e.parent.insertBefore(a,e.value[0]),E(e.value,function(e){return e.remove()}),e.parent=void 0}else if(ue(t))e.type="node",e.parent.insertBefore(t,e.value[0]),E(e.value,function(e){return e.remove()}),e.parent=void 0;else if(Array.isArray(t)){var i=[];E(e.value,function(e){t.includes(e)?i.push(e):e.remove()}),e.value=i,E(t,function(t,r){var n=e.value[r];n!==t&&(void 0===n?e.value[r-1]?e.value[r]=Q(t,e.value[r-1]):e.parent.appendChild(t):n.parentNode.replaceChild(t,n))})}e.value=t}}(r[t],e)}),e.element}function ie(e){return void 0!==e&&("number"==typeof e||"string"==typeof e)}function ue(e){return e instanceof HTMLElement||e instanceof Text}function ce(e,t,r){E(e,function(e){ue(e)&&r.insertBefore(e,t)}),t.remove()}function fe(e){var t=document.querySelector("*[data-import]");if(!t)return e&&e();var r=t.dataset.import;t.removeAttribute("data-import"),fetch(r).then(function(e){if(e.ok)return e.text();throw Error("Cannot import file: "+r)}).then(function(n){t.innerHTML=n,t.dispatchEvent(new CustomEvent("htmlLoaded",{bubbles:!0,detail:{file:r}})),fe(e)}).catch(function(r){t.innerHTML='<strong style="color:red;">Cannot import module!</strong>',console.error(r),fe(e)})}function se(e,t,r){return void 0===r&&(r=!1),e&&e.classList.add(t),function(n){return r&&e&&e===n?e.classList.toggle(t):(e&&e.classList.remove(t),n&&n.classList.add(t),e=n),e}}function le(e,t){var r=e.match(/[\w-:]+=".+?"/g);r&&(r=r.map(function(e){return function(e,t){return[e.substring(0,t),e.substring(t+1)]}(e.replace(/"/g,""),e.indexOf("="))}));var n,o=~e.indexOf("[")?e.slice(0,e.indexOf("[")):e,a=~o.indexOf(".")?o.split("."):[o],i=a[0];if(a.length>0&&(a=a.slice(1,a.length).join(" ")),~i.indexOf("#")){var u=i.split("#");i=u[0],n=u[1]}var c=document.createElement(i);return n&&(c.id=n),t&&("string"==typeof t?c.innerHTML=t:t instanceof HTMLElement&&c.appendChild(t)),r&&r.forEach(function(e){return c.setAttribute(e[0],e[1])}),a&&(c.className=a),c}function de(e,t){void 0===t&&(t={});var r=t.isModule,n=t.onComplete,o=document.createElement("script");o.setAttribute("type",r?"module":"text/javascript"),n&&o.addEventListener("load",function e(){o.removeEventListener("load",e),n()}),o.setAttribute("src",e),document.head.appendChild(o)}function pe(e){return btoa(encodeURIComponent(e).replace(/%([0-9A-F]{2})/g,function(e,t){return String.fromCharCode("0x"+t)}))}function ve(e){return e.split("").reduce(function(e,t){return(e=(e<<5)-e+t.charCodeAt(0))&e},0)}export{U as PubSub,I as abort,y as arrayToObject,m as attachStyle,pe as base64,q as checkSchema,g as chunksArray,p as clipboard,b as compareArrays,K as copyAttrs,le as createElement,T as createEventHandler,D as debounce,u as deepOverride,M as domFilter,v as elFromString,l as events,$ as extractNodes,i as fuzzySearch,h as getNodesPath,A as getRandomSubarray,re as getRefs,ve as hashCode,F as highlight,e as hyphenate,fe as importHtml,W as inDeltaTime,r as inPolygon,de as includeScriptTag,Q as insertNodeAfter,X as insertNodeBefore,t as isObject,E as loop,d as loopstack,se as memoElement,Y as moveNodes,x as nodeListToArray,S as objectToFetchBody,H as parseResponse,n as plWordCase,J as placeStrBetween,B as queryToObject,o as rangeRandomInt,w as reduce,C as removeFromArray,R as request,z as schemaTypes,O as shuffleArray,N as sortByPhraseIndex,G as splitAtIndex,ne as template,V as throttle,a as uid,P as updateQuery};
