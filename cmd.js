var argv = require('minimist')(process.argv.slice(2));

var file = '';
if( argv.f ) file = argv.f;
else if( argv.file ) file = argv.file;

var namespace = '';
if( argv.n ) namespace = argv.n;
else if( argv.namespace ) namespace = argv.namespace;

var outfile = '';
if( argv.o ) outfile = argv.o;
else if( argv.outfile ) outfile = argv.outfile;

var wrappers = '';
if( argv.w ) wrappers = argv.w;
else if( argv.wrappers ) wrappers = argv.wrappers;

if( !file || !namespace ) {
  console.log('file [-f || --file], namespace [-n || --namespace] and outfile [-o || --outfile] required');
}

var es6ToPlv8 = require('./index');
es6ToPlv8(namespace, file, outfile, wrappers);
