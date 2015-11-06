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
- Any files passed in the wrapper list will be have their namespace templates replaced.  See
more info about the namespace templates below.

### -f | --file

The module/NodeJS file being exported to PLV8.

### -o | --outfile

The full path of the file to be created.  If the file already exists it will be overwritten.
You don't need to add .sql, it will be added to the filename by default.

### -w | --wappers

The files to be parsed and appended to the outfile.  These wrapper files should wrap your
NodeJS functions with PLV8 function definitions.


## PLV8 wrappers

Any module function you want to use in PLV8 needs to be wrapped in a PLV8 function
definition.  To help with the namespacing of these wrappers inside the PostgreSQL
environment, es6-to-plv8 provides a simple templating strategy to build the namespace
into your wrappers.

Example.  Given the following module:
```js
module.exports = {
  foo : function() {
    return 'hello plv8 world';
  }
}
```

And let's say you want to create a namespace *Test* to be used inside PostgreSQL.
You could then create a wrapper file that looks like:

```sql
create or replace function {{ns}}foo()
returns text
language plv8 IMMUTABLE STRICT
as
$$
return {{jsns}}foo();
$$;
```

Note.  There are two namespaces here.
- **ns**: which is the PLV8 namepace.  In our example it will be replaced with '*Test_*'
- **jsns**: which is the NodeJS module exposed standalone namepace.  In our example it will be replaced with '*Test.*'

So after running the es6-to-plv8 with the Test namespace and passing the test module and wrapper above then importing the generated .sql file you would have

- JavaScript Land:
```js
Test.foo()
```

- PostgreSQL Land:
```sql
Test_init()
Test_foo()
```

So in PostgreSQL you would run:

```sql
postgres=# select Test_init();
 test_init
--------------

(1 row)

postgres=# select Test_foo();
 test_foo
-------------
 hello plv8 world
(1 row)
```
