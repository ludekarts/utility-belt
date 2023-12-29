function e(e){var r={"ą":"a","ć":"c","ę":"e","ł":"l","ń":"n","ó":"o","ś":"s","ż":"z","ź":"z"," ":"-"};return e.toLowerCase().replace(/[\Wąćęłńóśżź_ ]/g,function(e){return r[e]||""}).replace(/-{2,}/,"-")}function r(e){return!!e&&"symbol"!=typeof e&&"string"!=typeof e&&"number"!=typeof e&&"boolean"!=typeof e&&"function"!=typeof e&&!Array.isArray(e)}function t(e){return null!==e&&"object"==typeof e&&"function"==typeof e.then&&"function"==typeof e.catch}function n(e,r){for(var t=e[0],n=e[1],o=!1,i=0,a=r.length-1;i<r.length;a=i++){var u=r[i][0],c=r[i][1],f=r[a][1];c>n!=f>n&&t<(r[a][0]-u)*(n-c)/(f-c)+u&&(o=!o)}return o}function o(e){var r=[2,3,4],t=[11,12,13,14];return function(n){return 1===n?e.one:!r.includes(n%10)||t.includes(n)?e.multiple:e.couple}}function i(e,r){return Math.floor(Math.random()*(r-e+1))+e}function a(e){return void 0===e&&(e=""),e.includes("--short")?Math.floor(Math.random()*Date.now()).toString(36):crypto.randomUUID()}function u(e){return s(e)?e:Array.isArray(e)?c(e):f(e)}function c(e){return e.map(function(e){return Array.isArray(e)?c(e):s(e)?e:f(e)})}function f(e){return Object.keys(e).reduce(function(r,t){if(e.hasOwnProperty(t)){var n=e[t];r[t]=s(n)?n:Array.isArray(n)?c(n):Object.assign({},n)}return r},{})}function s(e){return null===e||["string","number","symbol","boolean","function","undefined"].includes(typeof e)}function l(e){var r=document.getElementById("_clipContainer_")||document.createElement("textarea");r.id||(r.id="_clipContainer_",r.style.opacity=0,r.style.position="fixed",r.style.pointerEvents="none",document.body.appendChild(r));try{return r.value=e,r.select(),document.execCommand("copy"),e}catch(e){return void console.error(e)}}function d(e,r){var t=r.length,n=e.length;if(n>t)return!1;if(n===t)return e===r;e:for(var o=0,i=0;o<n;o++){for(var a=e.charCodeAt(o);i<t;)if(r.charCodeAt(i++)===a)continue e;return!1}return!0}function p(e,r){return y(r)?void 0===r?e:r:Array.isArray(r)||Array.isArray(e)?h(e,r):v(e,r)}function v(e,r){if(void 0===e)return r;if(void 0===r)return e;if(null===e)return r;if(null===r)return r;var t=Object.keys(r),n=Object.keys(e),o=t.concat(n.filter(function(e){return!t.includes(e)}));return o.length?o.reduce(function(t,n){var o=r[n],i=e[n];return t[n]=y(o)?void 0===o?i:o:Array.isArray(i)||Array.isArray(o)?h(i,o):o instanceof RegExp?RegExp(o.source,o.flags):v(i,o),t},{}):e}function h(e,r){if(Array.isArray(e)&&Array.isArray(r)){for(var t=e.length,n=r.length,o=[],i=0;i<t||i<n;i++)o[i]=y(r[i])?void 0===r[i]?e[i]:r[i]:Array.isArray(e[i])||Array.isArray(r[i])?h(e[i],r[i]):v(e[i],r[i]);return o}return r}function y(e){return["string","number","boolean","symbol","function","undefined"].includes(typeof e)}var m={isNull:function(e){return null===e},isUndefined:function(e){return void 0===e},object:function(e){return r(e)},array:function(e){return Array.isArray(e)},number:function(e){return"number"==typeof e},string:function(e){return"string"==typeof e},symbol:function(e){return"symbol"==typeof e},boolean:function(e){return"boolean"==typeof e},matches:function(e){return function(r){return e.test(r)}},objectOf:function(e){return function(t){return r(t)&&{value:t,schema:e}}},arrayOf:function(e){return function(r){return Array.isArray(r)&&{value:r,schema:e}}}};function b(e,t,n){if(void 0===n&&(n={}),"function"==typeof t){var o=t(e);if(Array.isArray(o.value))return o.value.every(function(e){return Array.isArray(o.schema)?o.schema.some(function(r){return b(e,r,{silent:!0})}):b(e,o.schema)});if(r(o.schema))return Object.keys(o.schema).every(function(e){if(void 0===o.value[e])throw new Error('Missing property "'+e+'"');return b(o.value[e],o.schema[e])});if(!1===o){if(n.silent)return!1;throw console.error("Mismatch value:",e),new Error('Value "'+e+'" does not match schema type.')}return!0}throw new Error('Incorrect schema type. Got "'+typeof t+'" instead of schema-type function.')}function g(){return g=Object.assign||function(e){for(var r=1;r<arguments.length;r++){var t=arguments[r];for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])}return e},g.apply(this,arguments)}function w(e,r){(null==r||r>e.length)&&(r=e.length);for(var t=0,n=new Array(r);t<r;t++)n[t]=e[t];return n}function A(e,r){var t="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(t)return(t=t.call(e)).next.bind(t);if(Array.isArray(e)||(t=function(e,r){if(e){if("string"==typeof e)return w(e,r);var t=Object.prototype.toString.call(e).slice(8,-1);return"Object"===t&&e.constructor&&(t=e.constructor.name),"Map"===t||"Set"===t?Array.from(e):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?w(e,r):void 0}}(e))||r&&e&&"number"==typeof e.length){t&&(e=t);var n=0;return function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var x=0;function E(e){return"__private_"+x+++"_"+e}function O(e,r){if(!Object.prototype.hasOwnProperty.call(e,r))throw new TypeError("attempted to use private field on non-instance");return e}var C=["body"],k=["mode","body","cache","method","redirect","credentials","referrerPolicy"],j=["fallback","requestHash","cacheRequests","useErrorWrapper","doNotParseResponse"],P=/*#__PURE__*/E("updateResponseProcessor"),S=/*#__PURE__*/E("updateHeaders"),N=/*#__PURE__*/function(){function e(e){if(Object.defineProperty(this,S,{value:T}),Object.defineProperty(this,P,{value:R}),this.native={},this.headers={},this.requestConfig={},this.responseProcessor=[],r(e)){for(var t in e)e.hasOwnProperty(t)&&void 0!==e[t]&&this.update(t,e[t]);Object.freeze(this.native),Object.freeze(this.headers),Object.freeze(this.requestConfig),Object.freeze(this.responseProcessor)}else if(void 0!==e)throw new Error("Config argument should be Undefuned or an Object")}var t=e.prototype;return t.update=function(e,r){"responseProcessor"===e?O(this,P)[P](this,r):"headers"===e?O(this,S)[S](this,r):k.includes(e)?this.requestConfig[e]=r:j.includes(e)&&(this.native[e]=r)},t.merge=function(r){if(!r)return this;if(!(r instanceof e))throw new Error("Configuration object should be instace of RequestConfig");return new e(g({},this.requestConfig,r.requestConfig,{headers:g({},this.headers,r.headers||{})},this.native,r.native,{responseProcessor:[].concat(this.responseProcessor,r.responseProcessor||[])}))},e}();function R(e,r){if("function"==typeof r)e.responseProcessor=[r];else{if(!Array.isArray(r))throw new Error("ResponseProcessor should be Undefined. In other case it should return a Function or an Array");e.responseProcessor=r}}function T(e,t){if("function"==typeof t)e.headers=t(g({},e.headers));else{if(!r(t))throw new Error("Headers property should be an Object");e.headers=g({},t)}}function M(e){if(e&&!(e instanceof N))throw new Error("Configuration object should be instace of RequestConfig");var r=new Map,t=new Map,n=e||new N;function o(e,o){var i=n.merge(o),a=i.native,u=i.requestConfig,c=i.headers,f=i.responseProcessor;if(u.body)if("get"===u.method.toLowerCase()){var s=u.body,l=function(e,r){if(null==e)return{};var t,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)r.indexOf(t=i[n])>=0||(o[t]=e[t]);return o}(u,C);e+="string"==typeof s?"?"+s:"?"+function(e){if(H(e)||U(e)||Array.isArray(e))throw new Error("objectToUrlString: Given value is not a JSON object");return Object.keys(e).map(function(r){return function(e){return e.replace(/&$/g,"")}(H(e[r])?r+"="+e[r]:Array.isArray(e[r])?L(e[r],r):z(e[r],r))}).join("&")}(s),u=l}else u=g({},u,{body:I(u.body,c)});var d=""+e+(a.requestHash||""),p=a.cacheRequests&&t.has(d);if(p)return function(e,r){return Promise.resolve(e.get(r))}(t,d);var v=new AbortController,h=function(e){return r.delete(m),e},y=g({},u,{headers:c,signal:v.signal}),m=fetch(e,y).then(h).then(function(e){return a.doNotParseResponse?e:function(e,r,t){void 0===t&&(t=!1);try{var n,o=function(){if(e.ok)return n;if(r)return r;throw t?{response:n,status:e.status,statusText:e.statusText}:n},i=e.headers.get("content-type").split(";")[0],a=function(){if(/^text\//.test(i))return Promise.resolve(e.text()).then(function(e){n=e});var r=function(){if(/^image\//.test(i))return Promise.resolve(e.blob()).then(function(e){n=e});var r=function(){if("application/json"===i)return Promise.resolve(e.json()).then(function(e){n=e});var r=function(){if("multipart/form-data"===i)return Promise.resolve(e.formData()).then(function(e){n=e});console.warn("Not recognized content - type: "+e.headers.get("content-type")+" "),n=e}();return r&&r.then?r.then(function(){}):void 0}();return r&&r.then?r.then(function(){}):void 0}();return r&&r.then?r.then(function(){}):void 0}();return Promise.resolve(a&&a.then?a.then(o):o())}catch(e){return Promise.reject(e)}}(e,a.fallback,a.useErrorWrapper)}).then(function(e){return a.cacheRequests?function(e,r,t,n){var o=Boolean(n)?n.reduce(function(e,r){return r(e)},e):e;return t.set(r,o),o}(e,d,t,f):f?f.reduce(function(e,r){return r(e)},e):e}).catch(function(e){return function(r){throw e(),r}}(h));return!p&&r.set(m,function(){return v.abort()}),m}return{get:function(e,r){return o(e,r instanceof N?r.merge(new N({method:"GET"})):Boolean(r)?new N({method:"GET",body:r}):new N({method:"GET"}))},post:function(e,r){return o(e,r instanceof N?r.merge(new N({method:"POST"})):Boolean(r)?new N({method:"POST",body:r}):new N({method:"POST"}))},abort:function(e){r.has(e)&&(r.get(e)(),r.delete(e))},request:o,releaseCache:function(e,r){if(void 0===r&&(r=""),"string"!=typeof r)throw new Error("RequestHash need to be a string");var n=e?e instanceof RegExp?e:""+e+r:null;if("string"==typeof n)t.delete(n);else if(n instanceof RegExp)for(var o,i=A(t.keys());!(o=i()).done;){var a=o.value;n.test(a)&&t.delete(a)}else t.clear()},updateConfig:function(e){for(var r in e)e.hasOwnProperty(r)&&n.update(r,e[r])}}}function I(e,t){void 0===t&&(t={});var n=t["content-type"]||t["Content-Type"];if(e)return"application/json"===n||"text/plain"===n?JSON.stringify(e):"application/x-www-form-urlencoded"===n&&r(e)?new URLSearchParams(e):r(e)?q(e):JSON.stringify(e)}function q(e){var r=new URLSearchParams;return Object.keys(e).forEach(function(t){var n=H(e[t])?e[t]:JSON.stringify(e[t]);r.append(t,n)}),r}function L(e,r){void 0===r&&(r="");var t="";return e.forEach(function(e,n){if(U(e))throw new Error("objectToUrlString: Encounter not allowed value at: "+r+" index: "+n);H(e)?t+=r+"[]="+e+"&":Array.isArray(e)?t+=L(e,r+"["+n+"]"):t+=z(e,r+"["+n+"]")}),t}function z(e,r){void 0===r&&(r="");var t="";return Object.keys(e).forEach(function(n){if(U(e[n]))throw new Error("objectToUrlString: Encounter not allowed value at: "+r);return H(e[n])?t+=r+"["+n+"]="+e[n]+"&":Array.isArray(e[n])?t+=L(e[n],r+"["+n+"]"):t+=z(e[n],r+"["+n+"]"),t}),t}function U(e){return null==e||"symbol"==typeof e||"function"==typeof e}function H(e){return"string"==typeof e||"number"==typeof e||"boolean"==typeof e}function B(){var e=[].slice.call(arguments),r=e.pop(),t=r.indexOf("?");if(-1==t)return[];var n=new URLSearchParams(r.slice(t+1));return e.map(function(e){var r=n.getAll(e);return r.length<2?r[0]:r})}function D(e,r,t){var n=e.slice(0,e.indexOf("?")+1),o=n?e.slice(e.indexOf("?")+1,e.length):e,i="string"==typeof r,a=new URLSearchParams(o);return i?$(a,r,t):Object.keys(r).forEach(function(e){var t=r[e];Array.isArray(t)?(a.delete(e),t.forEach(function(r){return a.append(e,r)})):$(a,e,t)}),n+a.toString()}function $(e,r,t){void 0===t?e.delete(r):e.set(r,t)}function _(e,r){return e.reduce(function(e,t){return e[t[r]]=t,e},{})}function F(e,r){for(var t=0,n=e.length,o=[];t<n;t+=r)o.push(e.slice(t,t+r));return o}function G(e,r){return{added:r.filter(function(r){return!~e.indexOf(r)}),removed:e.filter(function(e){return!~r.indexOf(e)})}}function K(e,r){for(var t,n,o=e.slice(0),i=e.length,a=i-r;i-- >a;)t=o[n=Math.floor((i+1)*Math.random())],o[n]=o[i],o[i]=t;return o.slice(a)}function X(e){for(var r=[],t=-1,n=e.length;++t!==n;r[t]=e[t]);return r}function J(e,r,t){for(var n=-1,o=e.length,i=o-1;++n<o;)t=r(t,e[n],n,n===i);return t}function V(e,r){for(var t=0,n=e.length;t<n;)r(e[t],t,e),t++}function W(e){for(var r,t,n=e.length,o=[].concat(e);0!==n;)t=Math.floor(Math.random()*n),r=o[n-=1],o[n]=o[t],o[t]=r;return o}function Q(e,r,t){void 0===t&&(t=function(e){return e});var n=r.toLowerCase();return[].concat(e).sort(function(e,r){var o=t(e).indexOf(n),i=t(r).indexOf(n);return(o<0?Infinity:o)-(i<0?Infinity:i)})}function Y(e,r){var t=[].concat(e);return t.splice(r,1),t}function Z(e,r){var t=e.indexOf(r);return-1===t?e:Y(e,t)}function ee(e,r,t){var n=[].concat(e);return n.splice(r,1,t),n}function re(e,r,t){var n=[].concat(e),o=n.splice(r,1);return n.splice(t,0,o[0]),n}function te(e,r,t){var n=[].concat(e);return n.splice(r,0,t),n}function ne(e,r,t){var n=[].concat(e),o=n[r];return n[r]=n[t],n[t]=o,n}function oe(e,r){return e.map(function(e,t){return[e,r[t]]})}function ie(e,r){return void 0===r&&(r={includeCheckValues:!1}),Array.from(e.elements).reduce(function(e,t){return t.name&&("radio"===t.type?t.checked&&(e[t.name]=t.value):e[t.name]="checkbox"===t.type?r.includeCheckValues?{value:t.value,checked:t.checked}:t.checked:t.value),e},{})}function ae(e,r){var t=!e instanceof HTMLElement?document.querySelector(e):e;Array.from(t.elements).forEach(function(e){var t=r[e.name];void 0!==t&&(function(e){return null===e||"string"==typeof e||"boolean"==typeof e||"number"==typeof e}(t)?e.value=t:Object.keys(t).forEach(function(r){return e[r]=t[r]}))})}function ue(e){void 0===e&&(e={});var r=new Map,t=e.debug,n=void 0!==t&&t,o=e.logger;r.set("/",{observers:new Map,broadcasters:[]});var i={on:function(e,t,a){var u=ce(e,t,a),c=u.namespace,f=u.event,s=u.observer;!r.has(c)&&r.set(c,{observers:new Map,broadcasters:[]});var l=r.get(c);return"*"===f?!l.broadcasters.includes(s)&&l.broadcasters.push(s):(!l.observers.has(f)&&l.observers.set(f,[]),l.observers.get(f).push(s)),n&&o&&o('A new subscription "'+f+'" was added to namespace "'+c+'".'),i},off:function(e,t,n){var o=ce(e,t,n),a=o.namespace,u=o.event,c=o.observer;if(r.has(a)){var f=r.get(a);if(f.observers.has(u)){var s=f.observers.get(u),l=s.indexOf(c);~l&&(s.splice(l,1),s.length?f.observers.set(u,s):(f.observers.delete(u),0===f.observers.size&&"/"!==a&&r.delete(a)))}}return i},dispatch:function(e,t,a){var u=function(e,r,t){var n,o,i;return void 0===t?(n="/",o=e,i=r):(n=e,o=r,i=t),{namespace:n,event:o,message:i}}(e,t,a),c=u.namespace,f=u.event,s=u.message;if(r.has(c)){var l=r.get(c);if(l.broadcasters.length&&l.broadcasters.forEach(function(e){return e(s,f)}),l.observers.has(f)){for(var d=l.observers.get(f),p=d.length,v=0;v<p;v++)d[v](s,f);n&&o&&o("published",{namespace:c,event:f,message:s,observersList:d})}else n&&console.warn('Event "'+f+'" does not exist in "'+c+'" namespace.')}return i}};return n&&(i.getNamespace=function(e,t){var n=(void 0===t?{}:t).remove;return!0===(void 0!==n&&n)?("/"!==e&&r.delete(e),r):e?r.get(e):r}),Object.freeze(i)}function ce(e,r,t){var n,o,i;if(void 0===t?(n="/",o=e,i=r):(n=e,o=r,i=t),"string"!=typeof n)throw new Error("PubSub Error: namespace should be a string");if("string"!=typeof o)throw new Error("PubSub Error: subscribe event should be a string");if("function"!=typeof i)throw new Error("PubSub Error: the observer should be a function");return{namespace:n,event:o,observer:i}}function fe(e){void 0===e&&(e="button[data-action]");var r,t=new Map,n=Object.freeze({addAction:function(e,r){if(t.has(e))throw new Erron('Action "'+e+'" already exist.');return t.set(e,r),n},addDefaultAction:function(e){return r=e,n},done:function(n){return function(o){if(o.target.matches(e)){var i=o.target.dataset.action,a=t.get(i),u={action:i,event:o,dataset:o.target.dataset};"function"==typeof a?a(u):r&&r(u),"function"==typeof n&&n(u)}}}});return n}function se(e){var r=new Map,t=Object.freeze({key:function(e,n){var o=le(e);return r.set(o,n),t},done:function(){return function(t){var n=le({key:t.code,alt:t.altKey,ctrl:t.ctrlKey,meta:t.metaKey,shift:t.shiftKey});(!e||e(t))&&r.has(n)&&r.get(n)(t)}}});return t}function le(e){var r;if("string"==typeof e)r=e;else{if("object"!=typeof e)throw new Error("Keyboard Helper Error: Invalid event config");var t=e.ctrl,n=e.alt,o=e.meta;r=e.key+(Boolean(e.shift)?"+Shift":"")+(Boolean(t)?"+Ctrl":"")+(Boolean(n)?"+Alt":"")+(Boolean(o)?"+Meta":"")}return r}function de(e){var r={};return[].slice.call(arguments,1).forEach(function(t){e.addEventListener(t,function(e){return function(t){if(t.target.dataset[e]){var n=r[t.target.dataset[e]];n&&n(t)}}}(t))}),Object.freeze({add:function(e,t){r[e]||(r[e]=t)},callHandler:function(e,t){r[e](t)}})}function pe(e,r,t,n){return void 0===n&&(n=!1),e.addEventListener(r,t,n),function(){return e.removeEventListener(r,t,n)}}var ve=function(e){try{for(var r=window.atob(e),t=r.length,n=new Uint8Array(new ArrayBuffer(t)),o=0;o<t;o++)n[o]=r.charCodeAt(o);var i=new Blob([n],{type:"text/plain"}).stream();return Promise.resolve(i.pipeThrough(new DecompressionStream("gzip"))).then(function(e){var r=new Response(e);return Promise.resolve(r.blob()).then(function(e){return Promise.resolve(e.text()).then(JSON.parse)})})}catch(e){return Promise.reject(e)}},he=function(e){try{var r=new Blob([JSON.stringify(e)],{type:"application/json"}).stream().pipeThrough(new CompressionStream("gzip"));return Promise.resolve(new Response(r)).then(function(e){return Promise.resolve(e.blob()).then(function(e){return Promise.resolve(e.arrayBuffer()).then(function(e){return window.btoa(String.fromCharCode.apply(String,new Uint8Array(e)))})})})}catch(e){return Promise.reject(e)}};function ye(e){return window.btoa(encodeURIComponent(e).replace(/%([0-9A-F]{2})/g,function(e,r){return String.fromCharCode("0x"+r)}))}function me(e){return e.split("").reduce(function(e,r){return(e=(e<<5)-e+r.charCodeAt(0))&e},0)}function be(e,r){var t;return function(){var n=arguments,o=this;clearTimeout(t),t=setTimeout(function(){e.apply(o,[].slice.call(n))},r)}}var ge=function(e,r){var t,n=0;return function(){(t=new Date)-n<=r&&(e.apply(void 0,[].slice.call(arguments)),t=0),n=t}};function we(e,r){var t,n=this,o=!1;return function(){o||(clearTimeout(t),e.apply(n,[].slice.call(arguments)),o=!0,t=setTimeout(function(){return o=!1},r))}}function Ae(e,r){return[e.slice(0,r),e.slice(r)]}function xe(e,r,t){return""+e.slice(0,t)+r+e.slice(t,e.length)}function Ee(e){var r={},t=new Map;return r.on=function(e,n){if(t.has(e))throw new Error('MiniRDXError: Action name "'+e+'" already exist');if("string"!=typeof e)throw new Error("MiniRDXError: Action name should be a string");if("function"!=typeof n)throw new Error("MiniRDXError: Action reducer should be a function");return t.set(e,n),r},r.done=function(){return function(r,n){if(void 0===r&&(r=e),!n)throw new Error("MiniRDXError: Action is required to run a reducer");return t.has(n.type)?t.get(n.type)(r,n):r}},r}function Oe(e){var r,t=[],n=[e];if(!e)throw new Error("MiniRDXError: The Main Reducer is required to create a store");function o(e,n){var o={type:e,payload:n};r=i(o,r),function(e){return"initialize:true"!==e.type&&"extendReducer:true"!==e.type}(o)&&t.forEach(function(e){return e(r,o)})}function i(e,r){var t=n.reduce(function(r,t){var n;return"function"==typeof t.setter?(t.isNew&&"extendReducer:true"===e.type?(delete t.isNew,void 0===(n=t(void 0,e))&&(n=t(r,e))):n=t(r,e),"function"==typeof n?n(r):(t.setter(r,n),r)):t(r,e)},r);return t}return o.batch=function(){var e=[].slice.call(arguments);r=e.reduce(function(e,r){return i({type:r[0],payload:r[1]},e)},r),t.forEach(function(t){return t(r,function(e){return e.reduce(function(e,r){return[].concat(e,[{type:r[0],payload:r[1]}])},[])}(e))})},o("initialize:true"),{getState:function(){return r},subscribe:function(e){return!t.includes(e)&&t.push(e),function(){t=t.filter(function(r){return r!==e})}},dispatch:o,extendReducer:function(e,r){if("string"!=typeof r)throw new Error("MiniRDXError: Reducer's statePath should bw a string with dot notation e.g.: 'user.cars[1].name' ");var t=Ce(r),i=t.getter,a=function(r,t){return e(void 0===r?void 0:i(r),t)};a.setter=t.setter,a.isNew=!0,n.push(a),o("extendReducer:true")}}}function Ce(e){if("string"==typeof e&&/^[\w\[\]\d\.]+$/.test(e))return{getter:new Function("state","return state."+e),setter:new Function("state","value","state."+e+" = value")};throw new Error("MiniRDXError: Selector should be a string with dot notation e.g.: 'user.cars[1].name' ")}function ke(e){var r,t=0,n=new Array(e);return Object.freeze({push:function(o){o&&(n[t]=o,r=n[t],t=(t+1)%e)},pull:function(){return r=n[t=(t-1+e)%e],n[t]=void 0,r},get:function(e){return n[e]},head:function(){return r},getAll:function(){return n}})}function je(e){void 0===e&&(e="");var r=-1,t=[],n={pushState:function(e){r++,t.length-1>r&&t.splice(r),t[r]=e},undo:function(){return r--<1&&r++,t[r]},redo:function(){return r++>t.length-2&&r--,t[r]},current:function(){return t[r]},purge:function(){r=-1,t=[]},length:function(){return t.length},pointerIndex:function(){return r}};return e.includes("--debug")&&(n.debug=function(){return{history:t,pointer:r}}),Object.freeze(n)}function Pe(e){if(void 0===e||!Boolean(e.raw))throw new Error("html helper should be used as a tagFunction");return{markup:e.raw,inserts:[].slice.call(arguments,1)}}function Se(e,r){var t=e(r),n=Ie(t.markup,t.inserts),o=n.element;return o.update=Le(o,n.bindings,n.attributes,e),o.refs=ze(o),o}var Ne=[],Re=3e5,Te=setInterval(Me,Re);function Me(){for(var e=function(e){var r=Ne[e];if(r)if(Array.isArray(r))for(var t=0;t<r.length;t++)document.contains(array[t])||r.splice(t,0);else Object.keys(r).forEach(function(e){document.contains(r[e])||delete r[e]})},r=0;r<Ne.length;r++)e(r)}function Ie(e,r){var t={},n=[],o=document.createElement("div"),i=We(r),a=J(Array.from(e),function(e,r,t,o){var a=i[t],u=e+=r,c={value:a,index:t,static:!1};if(!o){var f;if(function(e){return e.lastIndexOf("<")>e.lastIndexOf(">")}(u)){var s=function(e){var r=e.lastIndexOf("<");return{head:e.slice(0,r),element:e.slice(r)}}(u),l=s.head,d=s.element;u=d.includes("data-hook-index")?function(e,r,t){return e+r.replace(/data-hook-index="(.+?)"/,function(e,r){return'data-hook-index="'+r+" "+t+'"'})}(l,d,t):function(e,r,t){return e+xe(r,' data-hook-index="'+t+'"',r.indexOf(" "))}(l,d,t),f="%#"+t+"#%"}else f=De(a)||_e(a)?'<i data-hook-index="'+t+'" data-hook-type="text"></i>':Fe(a)?'<i data-hook-index="'+t+'" data-hook-type="node"></i>':Array.isArray(a)?'<i data-hook-index="'+t+'" data-hook-type="list"></i>':Ge(a)?'<i data-hook-index="'+t+'" data-hook-type="partial"></i>':function(e,r){var t=r.slice(r.lastIndexOf("<"));return"function"==typeof e&&t.includes("$items")}(a,u)?'<i data-hook-index="'+t+'" data-hook-type="repeater"></i>':"";return n.push(c),u+f}return u},"");o.insertAdjacentHTML("beforeend",a),V(X(o.querySelectorAll("[data-hook-index]")),function(e){var r=e.dataset.hookType;if(void 0===r){var o=Array.prototype.slice.call(e.attributes).reduce(function(e,r){if(new RegExp("%#\\d+#%","g").test(r.value)){var t=Array.from(r.value.matchAll(new RegExp("%#(\\d+)#%","g"))).map(function(e){return e[1]}),n={name:r.name,template:r.value};0===n.name.indexOf("?")&&(n.name=n.name.slice(1),n.bool=!0);for(var o,i=A(t);!(o=i()).done;)e[o.value]=n}return e},{});V(Object.keys(o),function(r){var t=n[r];t.ref=e,t.container=Ke(e);var i=o[r];if(i.bool)t.type="attribute:bool",e.removeAttribute("?"+i.name),t.value?e.setAttribute(i.name,i.name):e.removeAttribute(i.name);else if(function(e,r){return"$key"===e&&"function"==typeof r||"$items"===e&&Array.isArray(r)}(i.name,t.value))"$key"===i.name&&(t.static=!0,t.repeaterKey=!0,t.type="attribute:repeater",e.removeAttribute(i.name)),"$items"===i.name&&(t.repeaterItems=!0,t.type="attribute:repeater",e.removeAttribute(i.name)),delete o[r];else if(function(e,r){return e.startsWith("on")&&"function"==typeof r}(i.name,t.value))t.static=!0,t.type="attribute:callback",e.removeAttribute(i.name),delete o[r],e[i.name]=t.value;else{if(!$e(t.value))throw new Error('Only String, Numbers, Undefined or False can be passed as attributes. Got: "'+typeof value+'" at "'+r+'" value.');t.type="attribute",Be(e,i,n)}}),t=g({},t,o)}else{var i=Number(e.dataset.hookIndex),a=n[i];if("text"===r)a.type="text",a.ref=document.createTextNode(De(a.value)?"":a.value),a.container=Ke(e),a.container.ref.replaceChild(a.ref,e);else if("node"===r)a.type="node",a.ref=a.value,a.container=Ke(e),a.container.ref.replaceChild(a.ref,e);else if("list"===r)a.type="list",a.ref=e.parentNode,a.container=Ke(e),Je(a.value,e);else if("partial"===r)a.type="partial",a.ref=qe(a.value.markup,a.value.inserts),a.container=Ke(e),a.container.ref.replaceChild(a.ref,e);else if("repeater"===r){a.type="repeater",a.ref=e.parentNode,a.container=Ke(e);var u=a.value,c=function(e,r){for(var t,n,o,i=Number(e.dataset.hookIndex)-1;i>-1;){if(!0===r[i].repeaterItems&&(o=r[i].value,n=i),!0===r[i].repeaterKey){t=r[i].value;break}i--}return{items:o,itemsIndex:n,keySelector:t}}(e,n),f=c.itemsIndex,s=function(e,r,t){Ne.push({});var n=Ne.length-1;return{elements:r.map(function(r){var o=e(r);return Ge(o)?Ne[n][t(r)]=qe(o.markup,o.inserts,e):(Ne[n][t(r)]=o,o)}),updateRepeater:function(r){return r.map(function(r){var o=Ne[n][t(r)];if(!o){var i=e(r);return Ne[n][t(r)]=Ge(i)?qe(i.markup,i.inserts,e):i}return o.update?o.update(r):o})}}}(u,c.items,c.keySelector),l=s.updateRepeater;a.value=s.elements,a.repeater={update:l,sourceIndex:f},Je(a.value,e)}}e.removeAttribute("data-hook-index")});var u=function(e){return 1===e.children.length?e.children[0]:e}(o);return{element:u,bindings:n,attributes:t}}function qe(e,r,t){var n=Ie(e,r),o=n.element;return o.update=Le(o,n.bindings,n.attributes,t),o.refs=ze(o),o.update.isPartial=!0,o}function Le(e,r,t,n){return function(o){var i=n?n(o).inserts:o;if(!i)throw new Error("Cannot update component. Invalid input");return V(We(i),function(e,r){return function(t,n){return!1===Boolean(e[n].static)&&t!==e[n].value&&function(e,r,t,n){var o=r[e];if(o){if("attribute:bool"===o.type){var i=t[o.index];o.value?o.ref.setAttribute(i.name,i.name):o.ref.removeAttribute(i.name)}if("attribute:repeater"===o.type&&!0===o.repeaterItems)o.value=n;else if("attribute"===o.type){if(!$e(n))throw new Error('Only String, Numbers, Undefined or False can be passed as attributes. Got: "'+typeof n+'" at value of index: "'+o.index+'".');o.value=n,Be(o.ref,t[o.index],r)}else if("text"===o.type){if(De(n))o.ref.textContent="";else if(_e(n))o.ref.textContent=n;else if(Fe(n))o.type="node",o.container.ref.replaceChild(n,o.ref),o.ref=n;else if(Ge(n)){var a=qe(n.markup,n.inserts);o.type="partial",o.container.ref.replaceChild(a,o.ref),o.ref=a}else Array.isArray(n)&&(Je(n,o.ref),o.type="list",o.ref=n);o.value=n}else if("node"===o.type){if(De(n)){var u=document.createTextNode("");o.container.ref.replaceChild(u,o.ref),o.type="text",o.ref=u}else if(_e(n)){var c=document.createTextNode(n);o.container.ref.replaceChild(c,o.ref),o.type="text",o.ref=c}else if(Fe(n))o.container.ref.replaceChild(n,o.ref),o.ref=n;else if(Ge(n)){var f=qe(n.markup,n.inserts);o.container.ref.replaceChild(f,o.ref),o.type="partial",o.ref=f}else Array.isArray(n)&&(Je(n,o.ref),o.type="list",o.ref=n);o.value=n}else if("list"===o.type){if(De(n)){var s=document.createTextNode("");He(o.container.index,s,o.container.ref),Ve(o.value,o.container.ref),o.type="text",o.ref=s}else if(_e(n)){var l=document.createTextNode(n);He(o.container.index,l,o.container.ref),Ve(o.value,o.container.ref),o.type="text",o.ref=l}else if(Fe(n))He(o.container.index,n,o.container.ref),Ve(o.value,o.container.ref),o.type="node",o.ref=n;else if(Ge(n)){var d=qe(n.markup,n.inserts);He(o.container.index,d,o.container.ref),Ve(o.value,o.container.ref),o.type="partial",o.ref=d}else Array.isArray(n)&&Ue(o,n);o.value=n}else if("partial"===o.type){if(De(n)){var p=document.createTextNode("");o.container.ref.replaceChild(p,o.ref),o.type="text",o.ref=p}else if(_e(n)){var v=document.createTextNode(n);o.container.ref.replaceChild(v,o.ref),o.type="text",o.ref=v}else Fe(n)?(o.container.ref.replaceChild(n,o.ref),o.type="node",o.ref=n):Ge(n)?o.ref.update(n.inserts):Array.isArray(n)&&(Je(n,o.ref),o.type="list",o.ref=n);o.value=n}else if("repeater"===o.type){var h=o.repeater.update(r[o.repeater.sourceIndex].value);Ue(o,h),o.value=h}}}(n,e,r,t)}}(r,t)),e}}function ze(e){var r={};return V(X(e.querySelectorAll("[\\$ref]")),function(e){var t=e.getAttribute("$ref");r[t]=e,e.removeAttribute("$ref")}),Object.freeze(r)}function Ue(e,r){var t=[];V(e.value,function(n,o){var i=e.container.index+o;(Fe(n)&&!r.includes(n)||Ge(n))&&(e.value=Z(e.value,n),t.push(e.container.ref.childNodes[i]))}),V(r,function(r,t){var n=e.container.index+t;-1===e.value.indexOf(r)?Ge(r)?He(n,qe(r.markup,r.inserts),e.container.ref):He(n,r,e.container.ref):e.value[t]!==r&&He(n,r,e.container.ref)}),V(t,function(e){return e.remove()})}function He(e,r,t){r!==t.childNodes[e]&&(0===e?0===t.childNodes.length?t.append(r):t.childNodes[0].before(r):t.childNodes[e-1].after(r))}function Be(e,r,t){var n=r.template.replace(/%#(\d+)#%/g,function(e,r){var n=t[Number(r)].value;return void 0===n||!1===n?"":n});e.setAttribute(r.name,n),"value"===r.name&&(e.value=n)}function De(e){return void 0===e||!1===e}function $e(e){return void 0===e||!1===e||"number"==typeof e||"string"==typeof e}function _e(e){return"number"==typeof e||"string"==typeof e}function Fe(e){return e instanceof HTMLElement||e instanceof Text}function Ge(e){return e.hasOwnProperty("markup")&&e.hasOwnProperty("inserts")&&Array.isArray(e.inserts)&&Array.isArray(e.markup)}function Ke(e){return{ref:e.parentNode,index:Xe(e)}}function Xe(e){for(var r=0;null!==(e=e.previousSibling);)r++;return r}function Je(e,r){V(e,function(e){Fe(e)?r.before(e):Ge(e)&&r.before(qe(e.markup,e.inserts))}),r.remove()}function Ve(e,r){V(e,function(e){return e.parentNode===r&&e.remove()})}function We(e){return e.map(function(e){return"string"==typeof e?Qe(e):e})}function Qe(e){var r={"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"};return e.replace(/[&<>'"]/g,function(e){return r[e]})}function Ye(e){var r={"&amp;":"&","&#38;":"&","&lt;":"<","&#60;":"<","&gt;":">","&#62;":">","&apos;":"'","&#39;":"'","&quot;":'"',"&#34;":'"'};return e.replace(/&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g,function(e){return r[e]})}function Ze(e){var r,n,o,i,a,u,c;function f(s){var l=[].slice.call(arguments,1);return s instanceof HTMLElement&&(l.unshift(s),s=void 0),i||(i=function(e,r){var n=new Map,o=[];return function(i,a){if(n.has(i))return n.get(i);if("function"==typeof a){var u=a();if(t(u)){o.push(void 0);var c=o.length-1;u.then(function(t){o[c]=t,e.apply(void 0,[void 0].concat(r))}).catch(function(t){o[c]=t,e.apply(void 0,[void 0].concat(r))})}else o.push(u)}else o.push(a);var f=o.length-1,s=[function(e){return void 0===o[f]&&void 0!==e?e:o[f]},function(t){return o[f]="function"==typeof t?t(o[f]):t,e.apply(void 0,[void 0].concat(r)),o[f]}];return n.set(i,s),s}}(f,l)),a||(a=function(e){return!c&&(c=e)}),n?void 0===s?n.update({state:o,children:l,createValue:i,useRef:r,onCreate:a}):o!==s&&(n.update({state:s,children:l,createValue:i,useRef:r,onCreate:a}),o=s):(n=Se(e,{state:s,children:l,createValue:i,useRef:r=function(e,r){return n&&r(n.refs[e])},onCreate:a}),u=null==c?void 0:c(n,n.refs,s),o=s),n}return f.cleanup=function(){null==u||u(),n.remove(),n.refs=null,n.update=null,n=null,o=null,i=null,a=null,c=null,u=null,r=null},f}function er(e,r){void 0===r&&(r=!1);var t=document.createRange().createContextualFragment(e);if(!0===r){if(1===t.childElementCount)return t.firstElementChild;var n=document.createElement("div");return n.append(t),n}return t}function rr(e){if(!e)throw new Error("getNodesPath error: stopSelector is required");return function r(t,n){return void 0===n&&(n=[t]),t.parentNode.matches(e)?n:(n.push(t.parentNode),r(t.parentNode,n))}}function tr(e,r){var t;return t=(t=r&&document.querySelector('style[data-style-name="'+r+'"]'))||document.createElement("style"),r&&(t.dataset.styleName=r),document.head.appendChild(t).textContent+=e,t}function nr(e,r,t){void 0===t&&(t=[]),Array.from(e.attributes||[]).forEach(function(e){return!~t.indexOf(e.name)&&r.setAttribute(e.name,e.value)})}function or(e,r,t){if(void 0===t&&(t="--into"),t.includes("--before"))for(;e.childNodes.length>0;)r.before(e.firstChild);else if(t.includes("--after"))for(;e.childNodes.length>0;)r.after(e.firstChild);else for(;e.childNodes.length>0;)r.appendChild(e.firstChild);return t.includes("--rm-source")&&e.remove(),r}function ir(e,r){if(!r.length)return e;for(var t,n=[],o=function(e){var r=e.split(","),t=r.length>1?r.reduce(function(e,r){var t=r.trim();return t.length?""+e+t+"|":e},""):r[0]+"|";return new RegExp(t.slice(0,-1),"gi")}(r);t=o.exec(e);)n.push([t.index,t.index+t[0].length]);return n.reverse().reduce(function(e,r){var t=r[0],n=r[1];return e.slice(0,t)+"<strong>"+e.slice(t,n)+"</strong>"+e.slice(n)},e)}function ar(e){var r=document.querySelector("*[data-import]");if(!r)return e&&e();var t=r.dataset.import;r.removeAttribute("data-import"),fetch(t).then(function(e){if(e.ok)return e.text();throw Error("Cannot import file: "+t)}).then(function(n){r.innerHTML=n,r.dispatchEvent(new CustomEvent("htmlLoaded",{bubbles:!0,detail:{file:t}})),ar(e)}).catch(function(t){r.innerHTML='<strong style="color:red;">Cannot import module!</strong>',console.error(t),ar(e)})}function ur(e,r){var t=e.match(/[\w-:]+=".+?"/g);t&&(t=t.map(function(e){return function(e,r){return[e.substring(0,r),e.substring(r+1)]}(e.replace(/"/g,""),e.indexOf("="))}));var n,o=~e.indexOf("[")?e.slice(0,e.indexOf("[")):e,i=~o.indexOf(".")?o.split("."):[o],a=i[0];if(i.length>0&&(i=i.slice(1,i.length).join(" ")),~a.indexOf("#")){var u=a.split("#");a=u[0],n=u[1]}var c=document.createElement(a);return n&&(c.id=n),r&&("string"==typeof r?c.innerHTML=r:(r instanceof HTMLElement||r instanceof DocumentFragment)&&c.append(r)),t&&t.forEach(function(e){return c.setAttribute(e[0],e[1])}),i&&(c.className=i),c}function cr(e,r){void 0===r&&(r={});var t=r.isModule,n=r.onComplete,o=document.createElement("script");o.setAttribute("type",t?"module":"text/javascript"),n&&o.addEventListener("load",function e(){o.removeEventListener("load",e),n()}),o.setAttribute("src",e),document.head.appendChild(o)}Se.__setTerminateInterval=function(e){if(void 0===e)return Re;0===e?clearInterval(Te):(clearInterval(Te),Re=e,Te=setInterval(Me,Re))};var fr="0.5.4";export{ue as PubSub,N as RequestConfig,_ as arrayToObject,tr as attachStyle,ye as base64Encode,fe as catchAction,de as catchEvents,b as checkSchema,F as chunksArray,G as compareArrays,Ze as component,he as compressJson,nr as copyAttrs,l as copyText,ur as createElement,pe as createEventHandler,je as createHistory,Ee as createReducer,M as createRequest,Ce as createSelector,Oe as createStore,be as debounce,ve as decompressJson,u as deepCopy,p as deepOverride,Se as dynamicElement,Qe as escapeHtml,er as fragment,d as fuzzySearch,ie as getFormFields,rr as getNodesPath,B as getQueryParams,i as getRandomNumber,K as getRandomSubarray,me as hashCode,ir as highlight,Pe as html,e as hyphenate,ar as importHtml,ge as inDeltaTime,n as inPolygon,cr as includeScriptTag,te as insertAtIndex,r as isObject,t as isPromise,se as keyboard,V as loop,ke as loopstack,or as moveNodes,X as nodeListToArray,q as objectToRequestBody,xe as placeStrBetween,J as reduce,Y as removeByIndex,Z as removeByInstance,ee as replaceByIndex,m as schemaTypes,W as shuffleArray,Q as sortByPhraseIndex,Ae as splitAtIndex,ne as swapItems,re as swapOrder,we as throttle,a as uid,Ye as unEscapeHtml,ae as updateForm,D as updateQueryParams,fr as version_utb,o as wordCase,oe as zipArray};
