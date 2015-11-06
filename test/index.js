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
