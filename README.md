# es6-to-plv8
Wrap an ES6 module so it can be used with PostgreSQL's plv8 module

## Command Line Usage

```
node cmd.js -n [namespace] -f [NodeJS file] -o [output file name] -w [optional: space or comma separated list of wrappers to include]
```

### -n | --namespace

The namespace to wrap the module in.  This namespace is used for a couple things
- Used in the standalone flag for browserify.  All module functions will be attached
to this namespace object.  So a module exposing methods foo() and bar() with
namespace Test will be called in PLV8 via Test.foo() and Test.bar()
- A [namespace]\_init() sql function will be created, wrapping the browserify code.
This function has to be called first before used any other function.
- An files passed in the wrapper list will be have their namespace templates replaced.  See
more info about the namespace templates below.

### -f | --file

The module/NodeJS file being exported to PLV8.

### -o | --outfile

The full path of the file to be created.  If the file already exists it will be overwritten.
You don't need to add .sql, it will be added to the filename by default.

### -w | --wappers

The files to be parsed and appended to the outfile.
