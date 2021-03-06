/*!
 * @overview RSVP - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/tildeio/rsvp.js/master/LICENSE
 * @version   3.2.1
 */
(function(){"use strict";function t(t){return"function"==typeof t||"object"==typeof t&&null!==t}function n(t){return"function"==typeof t}function r(t){return"object"==typeof t&&null!==t}function e(){}function o(t,n){for(var r=0,e=t.length;e>r;r++)if(t[r]===n)return r;return-1}function i(t){var n=t._promiseCallbacks;return n||(n=t._promiseCallbacks={}),n}function u(t,n){return"onerror"===t?void jt.on("error",n):2!==arguments.length?jt[t]:void(jt[t]=n)}function s(){setTimeout(function(){for(var t,n=0;n<Tt.length;n++){t=Tt[n];var r=t.payload;r.guid=r.key+r.id,r.childGuid=r.key+r.childId,r.error&&(r.stack=r.error.stack),jt.trigger(t.name,t.payload)}Tt.length=0},50)}function a(t,n,r){1===Tt.push({name:t,payload:{key:n._guidKey,id:n._id,eventName:t,detail:n._result,childId:r&&r._id,label:n._label,timeStamp:bt(),error:jt["instrument-with-stack"]?new Error(n._label):null}})&&s()}function c(t,n,r){var e=this,o=e._state;if(o===Dt&&!t||o===Kt&&!n)return jt.instrument&&St("chained",e,e),e;e._onError=null;var i=new e.constructor(g,r),u=e._result;if(jt.instrument&&St("chained",e,i),o){var s=arguments[o-1];jt.async(function(){x(o,i,s,u)})}else R(e,i,t,n);return i}function f(t,n){var r=this;if(t&&"object"==typeof t&&t.constructor===r)return t;var e=new r(g,n);return S(e,t),e}function l(t,n,r){return t===Dt?{state:"fulfilled",value:r}:{state:"rejected",reason:r}}function h(t,n,r,e){this._instanceConstructor=t,this.promise=new t(g,e),this._abortOnReject=r,this._validateInput(n)?(this._input=n,this.length=n.length,this._remaining=n.length,this._init(),0===this.length?C(this.promise,this._result):(this.length=this.length||0,this._enumerate(),0===this._remaining&&C(this.promise,this._result))):O(this.promise,this._validationError())}function p(t,n){return new Ot(this,t,!0,n).promise}function _(t,n){function r(t){S(i,t)}function e(t){O(i,t)}var o=this,i=new o(g,n);if(!gt(t))return O(i,new TypeError("You must pass an array to race.")),i;for(var u=t.length,s=0;i._state===Yt&&u>s;s++)R(o.resolve(t[s]),void 0,r,e);return i}function v(t,n){var r=this,e=new r(g,n);return O(e,t),e}function y(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}function d(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}function m(t,n){this._id=xt++,this._label=n,this._state=void 0,this._result=void 0,this._subscribers=[],jt.instrument&&St("created",this),g!==t&&("function"!=typeof t&&y(),this instanceof m?N(this,t):d())}function w(){return new TypeError("A promises callback cannot return that same promise.")}function g(){}function b(t){try{return t.then}catch(n){return Ut.error=n,Ut}}function E(t,n,r,e){try{t.call(n,r,e)}catch(o){return o}}function A(t,n,r){jt.async(function(t){var e=!1,o=E(r,n,function(r){e||(e=!0,n!==r?S(t,r,void 0):C(t,r))},function(n){e||(e=!0,O(t,n))},"Settle: "+(t._label||" unknown promise"));!e&&o&&(e=!0,O(t,o))},t)}function j(t,n){n._state===Dt?C(t,n._result):n._state===Kt?(n._onError=null,O(t,n._result)):R(n,void 0,function(r){n!==r?S(t,r,void 0):C(t,r)},function(n){O(t,n)})}function T(t,r,e){r.constructor===t.constructor&&e===kt&&constructor.resolve===Ct?j(t,r):e===Ut?O(t,Ut.error):void 0===e?C(t,r):n(e)?A(t,r,e):C(t,r)}function S(n,r){n===r?C(n,r):t(r)?T(n,r,b(r)):C(n,r)}function k(t){t._onError&&t._onError(t._result),I(t)}function C(t,n){t._state===Yt&&(t._result=n,t._state=Dt,0===t._subscribers.length?jt.instrument&&St("fulfilled",t):jt.async(I,t))}function O(t,n){t._state===Yt&&(t._state=Kt,t._result=n,jt.async(k,t))}function R(t,n,r,e){var o=t._subscribers,i=o.length;t._onError=null,o[i]=n,o[i+Dt]=r,o[i+Kt]=e,0===i&&t._state&&jt.async(I,t)}function I(t){var n=t._subscribers,r=t._state;if(jt.instrument&&St(r===Dt?"fulfilled":"rejected",t),0!==n.length){for(var e,o,i=t._result,u=0;u<n.length;u+=3)e=n[u],o=n[u+r],e?x(r,e,o,i):o(i);t._subscribers.length=0}}function M(){this.error=null}function P(t,n){try{return t(n)}catch(r){return qt.error=r,qt}}function x(t,r,e,o){var i,u,s,a,c=n(e);if(c){if(i=P(e,o),i===qt?(a=!0,u=i.error,i=null):s=!0,r===i)return void O(r,w())}else i=o,s=!0;r._state!==Yt||(c&&s?S(r,i):a?O(r,u):t===Dt?C(r,i):t===Kt&&O(r,i))}function N(t,n){var r=!1;try{n(function(n){r||(r=!0,S(t,n))},function(n){r||(r=!0,O(t,n))})}catch(e){O(t,e)}}function Y(t,n,r){this._superConstructor(t,n,!1,r)}function D(t,n){return new Y(Nt,t,n).promise}function K(t,n){return Nt.all(t,n)}function U(t,n){Xt[Wt]=t,Xt[Wt+1]=n,Wt+=2,2===Wt&&Gt()}function q(){var t=process.nextTick,n=process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);return Array.isArray(n)&&"0"===n[1]&&"10"===n[2]&&(t=setImmediate),function(){t(W)}}function F(){return function(){Ft(W)}}function G(){var t=0,n=new Ht(W),r=document.createTextNode("");return n.observe(r,{characterData:!0}),function(){r.data=t=++t%2}}function L(){var t=new MessageChannel;return t.port1.onmessage=W,function(){t.port2.postMessage(0)}}function V(){return function(){setTimeout(W,1)}}function W(){for(var t=0;Wt>t;t+=2){var n=Xt[t],r=Xt[t+1];n(r),Xt[t]=void 0,Xt[t+1]=void 0}Wt=0}function $(){try{var t=require,n=t("vertx");return Ft=n.runOnLoop||n.runOnContext,F()}catch(r){return V()}}function z(t){var n={};return n.promise=new Nt(function(t,r){n.resolve=t,n.reject=r},t),n}function B(t,n){return Nt.all(t,n)}function H(t,n){return Nt.resolve(t,n).then(function(t){return B(t,n)})}function J(t,r,e){var o=gt(t)?B(t,e):H(t,e);return o.then(function(t){if(!n(r))throw new TypeError("You must pass a function as filter's second argument.");for(var o=t.length,i=new Array(o),u=0;o>u;u++)i[u]=r(t[u]);return B(i,e).then(function(n){for(var r=new Array(o),e=0,i=0;o>i;i++)n[i]&&(r[e]=t[i],e++);return r.length=e,r})})}function Q(t,n,r){this._superConstructor(t,n,!0,r)}function X(t,n,r){this._superConstructor(t,n,!1,r)}function Z(t,n){return new X(Nt,t,n).promise}function tt(t,n){return new nn(Nt,t,n).promise}function nt(t,r,e){return Nt.all(t,e).then(function(t){if(!n(r))throw new TypeError("You must pass a function as map's second argument.");for(var o=t.length,i=new Array(o),u=0;o>u;u++)i[u]=r(t[u]);return Nt.all(i,e)})}function rt(){this.value=void 0}function et(t){try{return t.then}catch(n){return sn.value=n,sn}}function ot(t,n,r){try{t.apply(n,r)}catch(e){return sn.value=e,sn}}function it(t,n){for(var r,e,o={},i=t.length,u=new Array(i),s=0;i>s;s++)u[s]=t[s];for(e=0;e<n.length;e++)r=n[e],o[r]=u[e+1];return o}function ut(t){for(var n=t.length,r=new Array(n-1),e=1;n>e;e++)r[e-1]=t[e];return r}function st(t,n){return{then:function(r,e){return t.call(n,r,e)}}}function at(t,n){var r=function(){for(var r,e=this,o=arguments.length,i=new Array(o+1),u=!1,s=0;o>s;++s){if(r=arguments[s],!u){if(u=lt(r),u===an){var a=new Nt(g);return O(a,an.value),a}u&&u!==!0&&(r=st(u,r))}i[s]=r}var c=new Nt(g);return i[o]=function(t,r){t?O(c,t):void 0===n?S(c,r):n===!0?S(c,ut(arguments)):gt(n)?S(c,it(arguments,n)):S(c,r)},u?ft(c,i,t,e):ct(c,i,t,e)};return r.__proto__=t,r}function ct(t,n,r,e){var o=ot(r,e,n);return o===sn&&O(t,o.value),t}function ft(t,n,r,e){return Nt.all(n).then(function(n){var o=ot(r,e,n);return o===sn&&O(t,o.value),t})}function lt(t){return t&&"object"==typeof t?t.constructor===Nt?!0:et(t):!1}function ht(t,n){return Nt.race(t,n)}function pt(t,n){return Nt.reject(t,n)}function _t(t,n){return Nt.resolve(t,n)}function vt(t){throw setTimeout(function(){throw t}),t}function yt(t,n){jt.async(t,n)}function dt(){jt.on.apply(jt,arguments)}function mt(){jt.off.apply(jt,arguments)}var wt;wt=Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)};var gt=wt,bt=Date.now||function(){return(new Date).getTime()},Et=Object.create||function(t){if(arguments.length>1)throw new Error("Second argument not supported");if("object"!=typeof t)throw new TypeError("Argument must be an object");return e.prototype=t,new e},At={mixin:function(t){return t.on=this.on,t.off=this.off,t.trigger=this.trigger,t._promiseCallbacks=void 0,t},on:function(t,n){if("function"!=typeof n)throw new TypeError("Callback must be a function");var r,e=i(this);r=e[t],r||(r=e[t]=[]),-1===o(r,n)&&r.push(n)},off:function(t,n){var r,e,u=i(this);return n?(r=u[t],e=o(r,n),void(-1!==e&&r.splice(e,1))):void(u[t]=[])},trigger:function(t,n,r){var e,o,u=i(this);if(e=u[t])for(var s=0;s<e.length;s++)(o=e[s])(n,r)}},jt={instrument:!1};At.mixin(jt);var Tt=[],St=a,kt=c,Ct=f,Ot=h;h.prototype._validateInput=function(t){return gt(t)},h.prototype._validationError=function(){return new Error("Array Methods must be provided an Array")},h.prototype._init=function(){this._result=new Array(this.length)},h.prototype._enumerate=function(){for(var t=this.length,n=this.promise,r=this._input,e=0;n._state===Yt&&t>e;e++)this._eachEntry(r[e],e)},h.prototype._settleMaybeThenable=function(t,n){var r=this._instanceConstructor,e=r.resolve;if(e===Ct){var o=b(t);if(o===kt&&t._state!==Yt)t._onError=null,this._settledAt(t._state,n,t._result);else if("function"!=typeof o)this._remaining--,this._result[n]=this._makeResult(Dt,n,t);else if(r===Nt){var i=new r(g);T(i,t,o),this._willSettleAt(i,n)}else this._willSettleAt(new r(function(n){n(t)}),n)}else this._willSettleAt(e(t),n)},h.prototype._eachEntry=function(t,n){r(t)?this._settleMaybeThenable(t,n):(this._remaining--,this._result[n]=this._makeResult(Dt,n,t))},h.prototype._settledAt=function(t,n,r){var e=this.promise;e._state===Yt&&(this._remaining--,this._abortOnReject&&t===Kt?O(e,r):this._result[n]=this._makeResult(t,n,r)),0===this._remaining&&C(e,this._result)},h.prototype._makeResult=function(t,n,r){return r},h.prototype._willSettleAt=function(t,n){var r=this;R(t,void 0,function(t){r._settledAt(Dt,n,t)},function(t){r._settledAt(Kt,n,t)})};var Rt=p,It=_,Mt=v,Pt="rsvp_"+bt()+"-",xt=0,Nt=m;m.cast=Ct,m.all=Rt,m.race=It,m.resolve=Ct,m.reject=Mt,m.prototype={constructor:m,_guidKey:Pt,_onError:function(t){var n=this;jt.after(function(){n._onError&&jt.trigger("error",t,n._label)})},then:kt,"catch":function(t,n){return this.then(void 0,t,n)},"finally":function(t,n){var r=this,e=r.constructor;return r.then(function(n){return e.resolve(t()).then(function(){return n})},function(n){return e.resolve(t()).then(function(){return e.reject(n)})},n)}};var Yt=void 0,Dt=1,Kt=2,Ut=new M,qt=new M;Y.prototype=Et(Ot.prototype),Y.prototype._superConstructor=Ot,Y.prototype._makeResult=l,Y.prototype._validationError=function(){return new Error("allSettled must be called with an array")};var Ft,Gt,Lt=D,Vt=K,Wt=0,$t=({}.toString,U),zt="undefined"!=typeof window?window:void 0,Bt=zt||{},Ht=Bt.MutationObserver||Bt.WebKitMutationObserver,Jt="undefined"==typeof self&&"undefined"!=typeof process&&"[object process]"==={}.toString.call(process),Qt="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel,Xt=new Array(1e3);Gt=Jt?q():Ht?G():Qt?L():void 0===zt&&"function"==typeof require?$():V();var Zt=z,tn=J,nn=Q;Q.prototype=Et(Ot.prototype),Q.prototype._superConstructor=Ot,Q.prototype._init=function(){this._result={}},Q.prototype._validateInput=function(t){return t&&"object"==typeof t},Q.prototype._validationError=function(){return new Error("Promise.hash must be called with an object")},Q.prototype._enumerate=function(){var t=this,n=t.promise,r=t._input,e=[];for(var o in r)n._state===Yt&&Object.prototype.hasOwnProperty.call(r,o)&&e.push({position:o,entry:r[o]});var i=e.length;t._remaining=i;for(var u,s=0;n._state===Yt&&i>s;s++)u=e[s],t._eachEntry(u.entry,u.position)},X.prototype=Et(nn.prototype),X.prototype._superConstructor=Ot,X.prototype._makeResult=l,X.prototype._validationError=function(){return new Error("hashSettled must be called with an object")};var rn,en=Z,on=tt,un=nt,sn=new rt,an=new rt,cn=at;if("object"==typeof self)rn=self;else{if("object"!=typeof global)throw new Error("no global: `self` or `global` found");rn=global}var fn=rn,ln=ht,hn=pt,pn=_t,_n=vt;jt.async=$t,jt.after=function(t){setTimeout(t,0)};if("undefined"!=typeof window&&"object"==typeof window.__PROMISE_INSTRUMENTATION__){var vn=window.__PROMISE_INSTRUMENTATION__;u("instrument",!0);for(var yn in vn)vn.hasOwnProperty(yn)&&dt(yn,vn[yn])}var dn={race:ln,Promise:Nt,allSettled:Lt,hash:on,hashSettled:en,denodeify:cn,on:dt,off:mt,map:un,filter:tn,resolve:pn,reject:hn,all:Vt,rethrow:_n,defer:Zt,EventTarget:At,configure:u,async:yt};"function"==typeof define&&define.amd?define(function(){return dn}):"undefined"!=typeof module&&module.exports?module.exports=dn:"undefined"!=typeof fn&&(fn.RSVP=dn)}).call(this);

/*!
* basket.js
* v0.5.2 - 2015-02-07
* http://addyosmani.github.com/basket.js
* (c) Addy Osmani;  License
* Created by: Addy Osmani, Sindre Sorhus, Andrée Hansson, Mat Scales
* Contributors: Ironsjp, Mathias Bynens, Rick Waldron, Felipe Morais
* Uses rsvp.js, https://github.com/tildeio/rsvp.js
*/(function( window, document ) {
	'use strict';

	var head = document.head || document.getElementsByTagName('head')[0];
	var storagePrefix = 'basket-';
	var defaultExpiration = 5000;
	var inBasket = [];

	var addLocalStorage = function( key, storeObj ) {
		try {
			localStorage.setItem( storagePrefix + key, JSON.stringify( storeObj ) );
			return true;
		} catch( e ) {
			if ( e.name.toUpperCase().indexOf('QUOTA') >= 0 ) {
				var item;
				var tempScripts = [];

				for ( item in localStorage ) {
					if ( item.indexOf( storagePrefix ) === 0 ) {
						tempScripts.push( JSON.parse( localStorage[ item ] ) );
					}
				}

				if ( tempScripts.length ) {
					tempScripts.sort(function( a, b ) {
						return a.stamp - b.stamp;
					});

					basket.remove( tempScripts[ 0 ].key );

					return addLocalStorage( key, storeObj );

				} else {
					// no files to remove. Larger than available quota
					return;
				}

			} else {
				// some other error
				return;
			}
		}

	};

	var getUrl = function( url ) {
		var promise = new RSVP.Promise( function( resolve, reject ){
			var xhr = new XMLHttpRequest();
			xhr.open( 'GET', url );
			xhr.onreadystatechange = function() {
				if ( xhr.readyState === 4 ) {
					if ( ( xhr.status === 200 ) ||
							( ( xhr.status === 0 ) && xhr.responseText ) ) {
						resolve( {
							content: xhr.responseText,
							type: xhr.getResponseHeader('content-type')
						} );
					} else {
                        reject( new Error( xhr.statusText ) );
					}
				}
			};

			// By default XHRs never timeout, and even Chrome doesn't implement the
			// spec for xhr.timeout. So we do it ourselves.
			setTimeout( function () {
				if( xhr.readyState < 4 ) {
					xhr.abort();
				}
			}, basket.timeout );

			xhr.send();
		});

		return promise;
	};

	var saveUrl = function( obj ) {
		return getUrl( obj.url ).then( function( result ) {
			var storeObj = wrapStoreData( obj, result );

			if (!obj.skipCache) {
				addLocalStorage( obj.key , storeObj );
			}

			return storeObj;
		});
	};

	var wrapStoreData = function( obj, data ) {
		var now = +new Date();
		obj.data = data.content;
		obj.originalType = data.type;
		obj.type = obj.type || data.type;
		obj.skipCache = obj.skipCache || false;
		obj.stamp = now;
		obj.expire = now + ( ( obj.expire || defaultExpiration ) * 60 * 60 * 1000 );

		return obj;
	};

	var isCacheValid = function(source, obj) {
		return !source ||
			source.expire - +new Date() < 0  ||
			obj.unique !== source.unique ||
			(basket.isValidItem && !basket.isValidItem(source, obj));
	};

	var handleStackObject = function( obj ) {
		var source, promise, shouldFetch;

		if ( !obj.url ) {
			return;
		}

		obj.key =  ( obj.key || obj.url );
		source = basket.get( obj.key );
                
		obj.execute = obj.execute !== false;

		shouldFetch = isCacheValid(source, obj);

		if( obj.live || shouldFetch ) {
			if ( obj.unique ) {
				// set parameter to prevent browser cache
				obj.url += ( ( obj.url.indexOf('?') > 0 ) ? '&' : '?' ) + 'basket-unique=' + obj.unique;
			}
			promise = saveUrl( obj );

			if( obj.live && !shouldFetch ) {
				promise = promise
					.then( function( result ) {
						// If we succeed, just return the value
						// RSVP doesn't have a .fail convenience method
						return result;
					}, function() {
						return source;
					});
			}
		} else {
			source.type = obj.type || source.originalType;
			source.execute = obj.execute;
			promise = new RSVP.Promise( function( resolve ){
				resolve( source );
			});
		}

		return promise;
	};

	var injectScript = function( obj ) {
		var script = document.createElement('script');
		script.defer = true;
		// Have to use .text, since we support IE8,
		// which won't allow appending to a script
		script.text = obj.data;
		head.appendChild( script );
	};

	var handlers = {
		'default': injectScript
	};

	var execute = function( obj ) {
		if( obj.type && handlers[ obj.type ] ) {
			return handlers[ obj.type ]( obj );
		}

		return handlers['default']( obj ); // 'default' is a reserved word
	};

	var performActions = function( resources ) {
		return resources.map( function( obj ) {
			if( obj.execute ) {
				execute( obj );
			}

			return obj;
		} );
	};

	var fetch = function() {
		var i, l, promises = [];

		for ( i = 0, l = arguments.length; i < l; i++ ) {
			promises.push( handleStackObject( arguments[ i ] ) );
		}

		return RSVP.all( promises );
	};

	var thenRequire = function() {
		var resources = fetch.apply( null, arguments );
		var promise = this.then( function() {
			return resources;
		}).then( performActions );
		promise.thenRequire = thenRequire;
		return promise;
	};

	window.basket = {
        version:0,
        inBasketHas:function(val){
            for(var i in inBasket){
                if(inBasket[i]==val){
                    return true;
                }
            }
        },
		require: function() {
            if(store.enabled){
                if(store.get('web_vs')!=this.version){
                    store.set('web_vs',this.version);
                    basket.clear();
                }
            }
            var urlArr=[];
			for ( var a = 0, l = arguments.length-1; a < l; a++ ) {
				arguments[a]['execute'] = arguments[a]['execute'] !== false;
				if ( arguments[a].once && this.inBasketHas(arguments[a]['execute'])) {
					arguments[a]['execute'] = false;
				} else if ( arguments[a]['execute'] !== false && !this.inBasketHas(arguments[a]['execute']) < 0 ) {
					inBasket.push(arguments[a]['execute']);
				}
                urlArr.push(arguments[a]['url']);
			}
            var tmpArg=arguments;
            if(navigator.userAgent.toLowerCase().indexOf("msie 8") > 0 && urlArr.length>0 && tmpArg[tmpArg.length-1] instanceof Function){
                LazyLoad.js(urlArr, function () {
                    tmpArg[tmpArg.length-1]();
                });
                return {then:function(){}};
            }
            arguments[tmpArg.length-1]={'url':'local',execute:false};
			var promise = fetch.apply( null, arguments ).then( performActions );
			promise.thenRequire = thenRequire;
			return promise;
		},

		remove: function( key ) {
			localStorage.removeItem( storagePrefix + key );
			return this;
		},

		get: function( key ) {
			var item = localStorage.getItem( storagePrefix + key );
			try	{
				return JSON.parse( item || 'false' );
			} catch( e ) {
				return false;
			}
		},

		clear: function( expired ) {
			var item, key;
			var now = +new Date();

			for ( item in localStorage ) {
				key = item.split( storagePrefix )[ 1 ];
				if ( key && ( !expired || this.get( key ).expire <= now ) ) {
					this.remove( key );
				}
			}

			return this;
		},

		isValidItem: null,

		timeout: 5000,

		addHandler: function( types, handler ) {
			if( !Array.isArray( types ) ) {
				types = [ types ];
			}
			types.forEach( function( type ) {
				handlers[ type ] = handler;
			});
		},

		removeHandler: function( types ) {
			basket.addHandler( types, undefined );
		}
	};

	// delete expired keys
	basket.clear( true );

})( this, document );
