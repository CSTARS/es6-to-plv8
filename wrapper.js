var fs = require('fs');

var template =
'create or replace function {{name}}({{params}})\n'+
'  returns {{returns}} as $$\n'+
'    return {{jsname}}({{jsparams}});\n'+
'  $$ language plv8 IMMUTABLE STRICT;\n\n';


module.exports = function(options, watchers, rerun) {
  if( !options.definitions ) return '';

  var definitions;
  try {
    definitions = eval('('+fs.readFileSync(options.definitions,'utf-8')+')');
  } catch(e) {
    console.error('Unable to load wrapper definitions.');
    console.error(e);
    return '';
  }

  if( !watchers[options.definitions] && options.watch ) {
    watchers[options.definitions] = true;
    fs.watchFile(options.definitions, function (curr, prev) {
      rerun();
    });
  }

  var sql = '', fn = '', params = [], jsparams = [];
  for( var fnname in definitions ) {
    var used = {};    
    params = [];
    jsparams = [];

    if( definitions[fnname].params ) {
      for( var i = 0; i < definitions[fnname].params.length; i++ ) {
        var param = getName(definitions[fnname].params[i], used);
        params.push(param+' '+ definitions[fnname].params[i].type);
        jsparams.push(param);
      }
    }

    fn = template.replace(/\{\{name\}\}/, options.namespace+'_'+fnname);
    fn = fn.replace(/\{\{params\}\}/, params.join(', '));
    fn = fn.replace(/\{\{returns\}\}/, definitions[fnname].returns);
    fn = fn.replace(/\{\{jsname\}\}/, options.namespace+'.'+fnname);
    fn = fn.replace(/\{\{jsparams\}\}/, jsparams.join(', '));

    sql += fn;
  }

  return sql;
};

function getName(param, used) {
  if( param.name ) {
    used[param.name] = 1;
    return param.name;
  }

  for( var i = 0; i < alpha.length; i++ ) {
    if( used[alpha[i]] ) continue;
    used[alpha[i]] = 1;
    return alpha[i];
  }
}
var alpha = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ];
