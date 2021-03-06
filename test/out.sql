create or replace function Testing_init() returns void
language plv8
as
$function$
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Testing = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function() {
  return 'Hello';
};

},{}],2:[function(require,module,exports){
module.exports = {
  foo : require('./foo'),
  bar : 'baz',

  test : function(keys, vals) {
    var o = {};
    for(var i=0; i<keys.length; i++){
      o[keys[i]] = vals[i];
    }
    return JSON.stringify(o);
  },

  test2 : function(keys, value) {
    var o = {};
    for(var i=0; i<keys.length; i++){
      o[keys[i]] = value;
    }
    return JSON.stringify(o);
  }
};

},{"./foo":1}]},{},[2])(2)
});
$function$;


create or replace function Testing_test(keys text[], vals text[])
  returns text as $$
    return Testing.test(keys, vals);
  $$ language plv8 IMMUTABLE STRICT;

create or replace function Testing_test2(a text[], b text)
  returns text as $$
    return Testing.test2(a, b);
  $$ language plv8 IMMUTABLE STRICT;

create or replace function Testing_foo()
returns text
language plv8 IMMUTABLE STRICT
as
$$
return Testing.foo();
$$;


