// Meteor atmosphere package description.  Use in your meteor project with:
//
//     meteor add admithub:dot-get
//
Package.describe({
  name: 'admithub:dot-get',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Utilities for setting and clearing deep object properties using mongo-style dotted paths',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/AdmitHub/dot-get.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.addFiles('index.js');
  api.addFiles('meteor-namespace.js');

  api.export([
    'dot', 'dotGet', 'dotSet', 'dotClear', 'dotFlatten', 'mongoReplacementModifier'
  ]);
});
