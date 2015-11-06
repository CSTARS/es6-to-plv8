create or replace function {{ns}}foo()
returns text
language plv8 IMMUTABLE STRICT
as
$$
return {{jsns}}foo();
$$;
