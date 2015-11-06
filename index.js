var browserify = require('browserify');
var fs = require('fs');

var HEADER =
'create or replace function {{namespace}}_init() returns void\n'+
'language plv8\n'+
'as\n'+
'$function$\n';

var FOOTER = '$function$;\n';

module.exports = function(namespace, file, outfile, wrappers) {
  if( !fs.existsSync(file) ) {
    console.error('Invalid file: '+file);
    process.exit(-1);
  }

  if( !outfile.match(/\.sql/) ) {
    outfile += '.sql';
  }

  if( fs.existsSync(outfile) ) {
    fs.unlinkSync(outfile);
  }

  var b = browserify(file, {standalone: namespace});
  fs.writeFileSync(outfile, HEADER.replace(/\{\{namespace\}\}/, namespace));

  var reader = b.bundle();
  var writer = fs.createWriteStream(outfile, {flags: 'a'});

  reader.pipe(writer);
  writer.on('close', function(){
    fs.appendFileSync(outfile, '\n'+FOOTER+'\n\n');
    parseWrappers(namespace, outfile, wrappers);
  });
};

function parseWrappers(namespace, outfile, wrappers) {
  if( !wrappers ) return;

  var files = wrappers.split(/(,|\s)/);
  for( var i = 0; i < files.length; i++ ) {
    if( !files[i] ) continue;

    if( !fs.existsSync(files[i]) ) {
      console.log('Could not open SQL wrapper: '+files[i]);
    }

    var sql = fs.readFileSync(files[i], 'utf-8');
    fs.appendFileSync(outfile, replaceNs(sql, namespace)+'\n\n');
  }
}

function replaceNs(content, ns) {
  content = content.replace(/\{\{ns\}\}/g, ns+'_').replace(/\{\{namespace\}\}/g, ns+'_');
  return content.replace(/\{\{jsns\}\}/g, ns+'.').replace(/\{\{javascript_namespace\}\}/g, ns+'.');
}
