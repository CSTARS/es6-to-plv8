var browserify = require('browserify');
var fs = require('fs');
var exec = require('child_process').exec;
var generateWrapper = require('./wrapper.js');

var watchers = {};
var options = {};

var HEADER =
'create or replace function {{namespace}}_init() returns void\n'+
'language plv8\n'+
'as\n'+
'$function$\n';

var FOOTER = '$function$;\n';



function run(o) {
  options = o;
  console.log(options);

  if( !fs.existsSync(options.file) ) {
    console.error('Invalid file: '+options.file);
    process.exit(-1);
  }

  if( !options.outfile.match(/\.sql/) ) {
    options.outfile += '.sql';
  }

  rerun();
}

function rerun() {
  console.log('>>>> Building PLV8 sql file...');

  if( fs.existsSync(options.outfile) ) {
    fs.unlinkSync(options.outfile);
  }

  var b = browserify(options.file, {standalone: options.namespace});
  fs.writeFileSync(options.outfile, HEADER.replace(/\{\{namespace\}\}/, options.namespace));

  if( options.watch ) {
    b.on('file', function(file, id, parent) {
      if( watchers[file] ) return;
      watchers[file] = true;
      fs.watchFile(file, function (curr, prev) {
        rerun();
      });
    });
  }

  if( options.babelify ) {
    b.transform('babelify', eval('('+fs.readFileSync(options.babelify,'utf-8')+')'));
  }

  var reader = b.bundle();
  var writer = fs.createWriteStream(options.outfile, {flags: 'a'});

  reader.pipe(writer);
  writer.on('close', function(){
    fs.appendFileSync(options.outfile, '\n'+FOOTER+'\n\n');

    fs.appendFileSync(options.outfile, generateWrapper(options, watchers, rerun));

    parseDefinedWrappers();
  });
}

function parseDefinedWrappers() {
  if( !options.wrappers ) {
    afterRun();
    return;
  }

  var files = options.wrappers.split(/(,|\s)/);
  for( var i = 0; i < files.length; i++ ) {
    if( !files[i] ) continue;

    if( !fs.existsSync(files[i]) ) {
      console.log('Could not open SQL wrapper: '+files[i]);
    } else if( !watchers[files[i]] && options.watch ) {
      watchers[files[i]] = true;
      fs.watchFile(files[i], function (curr, prev) {
        rerun();
      });
    }

    var sql = fs.readFileSync(files[i], 'utf-8');
    fs.appendFileSync(options.outfile, replaceNs(sql, options.namespace)+'\n\n');
  }

  afterRun();
}

function replaceNs(content, ns) {
  content = content.replace(/\{\{ns\}\}/g, ns+'_').replace(/\{\{namespace\}\}/g, ns+'_');
  return content.replace(/\{\{jsns\}\}/g, ns+'.').replace(/\{\{javascript_namespace\}\}/g, ns+'.');
}

function afterRun() {
  if( options.db ) {
    var cmd = 'psql -d '+options.db+' -f '+options.outfile;
    console.log('Updating PostreSQL: '+cmd);
    exec(cmd, // command line argument directly in string
      {maxBuffer: 1024 * 500},
      function (error, stdout, stderr) {      // one easy function to capture data/errors
        if (error !== null) {
          console.error('psql exec error: ');
          console.error(error);
        } else if ( stderr ) {
          console.error('psql stderr: ' + stderr);
        }
    });
  }
}


module.exports = run;
