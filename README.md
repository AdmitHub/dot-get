dot-get
=======

Simple utilities for setting, getting, and clearing object properties using
mongo-style dot paths.

Installation
------------

Install with npm:

    npm install dot-get

or with bower:

    bower install dot-get

Usage
-----

In node:

    var dot = require("dot-get");
    var obj = {
      first: {
        second: 1
      },
      array: [1, {subobject: "good"}, 3]
    };

    // retrieving values
    dot.get(obj, "first.second"); // <= 1
    dot.get(obj, "first"); // <= {second: 1}
    dot.get(obj, "missing.whatever.ok"); // <= undefined
    dot.get(obj, "array.1.subobject"); // <= "good"

    // setting values
    dot.set(obj, "first.second", 2);
    dot.set(obj, "new.key", "ok");
    dot.set(obj, "array.0", {subobject: "grand"});

    // clearing values
    dot.clear(obj, "new.key");
    dot.clear(obj, "first");
    dot.clear(obj, "array.2");

    // flattening objects
    var obj = {
      first: {
        second: 1
      },
      array: [1, {subobject: "good"}, 3]
    };
    dot.flatten(obj);
    console.log(obj)
    {
     "first.second": 1,
     "array.0": 1,
     "array.1.subobject": "good",
     "array.2": 3
    }

    // Create a mongo replacement modifier for two objects.
    var orig = {a: 1, b: 2};
    var desired = {a: 2, c: 3};
    dot.mongoReplacementModifier(desired, orig);
    // {$set: {a: 2, c: 3}, $unset: {b: ""}}
