var expect = require("chai").expect;
var _ = require("lodash");
var dot = require("../index.js");

describe("dot-get", function() {
  var obj;
  beforeEach(function() {
    obj = {
      "simple": "simpleval",
      "nested": {
        "subkey": "subkeyval"
      },
      "deep": {
        "deeper": {
          "deepest": {
            "deeperest": "deepestValue"
          }
        }
      },
      "array": [
        {"subkey": "arraysubkeyval"},
        {"subkey1": "arraysubkeyval2"}
      ],
      "subarray": [
        {"subarray": [
          {"subkey": "gosh"},
          {"subkey1": "golly"}
        ]}
      ]
    }
  });


  it("dot.get's values", function() {
    var expectations = [
      "simple", "simpleval",
      "nested.subkey", "subkeyval",
      "deep.deeper.deepest.deeperest", "deepestValue",
      "array.0.subkey", "arraysubkeyval",
      "array.1.subkey1", "arraysubkeyval2",
      "subarray.0.subarray.0.subkey", "gosh",
      "subarray.0.subarray.1.subkey1", "golly",
      "nonsense", undefined,
      "nonsense.ok", undefined,
      "nonsense.0.ok.yeah", undefined,
    ];
    for (var i = 0; i < expectations.length; i+= 2) {
      expect(dot.get(obj, expectations[i])).to.equal(
        expectations[i + 1]
      );
    }
  });

  it("dot.set simple", function() {
    dot.set(obj, "simple", "fun");
    expect(obj.simple).to.equal("fun");
  });
  it("dot.set nested", function() {
    dot.set(obj, "nested.subkey", "great");
    expect(obj.nested.subkey).to.equal("great");
  });
  it("dot.set new", function() {
    dot.set(obj, "newthing", "ok");
    expect(obj.newthing).to.equal("ok");
  });
  it("dot.set new array", function() {
    dot.set(obj, "newthing.0", "fun");
    expect(obj.newthing).to.eql(["fun"]);
  });
  it("dot.set $ new array", function() {
    dot.set(obj, "newthing.$", "fun");
    expect(obj.newthing.length).to.equal(1);
    expect(obj.newthing[0]).to.equal("fun");
  });
  it("dot.set $ existing array", function() {
    dot.set(obj, "array.$.fun", "roight");
    expect(obj.array).to.eql([
      {"subkey": "arraysubkeyval"},
      {"subkey1": "arraysubkeyval2"},
      {"fun": "roight"}
    ]);
  });
  it("dot.set array object", function() {
    dot.set(obj, "newthing.0.grand", "great");
    expect(obj.newthing).to.eql([{grand: "great"}]);
  });
  it("dot.set array later index", function() {
    dot.set(obj, "newthing.1.grand", "great");
    // weird result here from doing a weird thing.
    expect(obj.newthing).to.eql([, {grand: "great"}]);
  });
  it("dot.set sub everything", function() {
    dot.set(obj, "subarray.0.subarray.1.subkey1", "Funtimes");
    expect(obj.subarray[0].subarray[1].subkey1).to.equal("Funtimes");
  });

  it("dot.clear's stuff", function() {
    dot.clear(obj, "simple");
    expect(obj.simple).to.be.undefined;
    dot.clear(obj, "nested.subkey");
    expect(obj.nested).to.eql({});
    dot.clear(obj, "nested");
    expect(obj.nested).to.be.undefined;
    dot.clear(obj, "deep");
    expect(obj.deep).to.be.undefined;
    dot.clear(obj, "array.0.subkey");
    expect(obj.array).to.eql([{}, {"subkey1": "arraysubkeyval2"}]);
    dot.clear(obj, "array.0")
    expect(obj.array).to.eql([{"subkey1": "arraysubkeyval2"}]);
    dot.clear(obj, "array");
    expect(obj.array).to.be.undefined;
    dot.clear(obj, "subarray.0.subarray");
    expect(obj.subarray[0]).to.eql({});
    dot.clear(obj, "subarray");
    expect(obj.subarray).to.be.undefined;
    expect(obj).to.eql({});
  });

  it("dot.flatten's stuff", function() {
    expect(dot.flatten(obj)).to.eql({
      "simple": "simpleval",
      "nested.subkey": "subkeyval",
      "deep.deeper.deepest.deeperest": "deepestValue",
      "array.0.subkey": "arraysubkeyval",
      "array.1.subkey1": "arraysubkeyval2",
      "subarray.0.subarray.0.subkey": "gosh",
      "subarray.0.subarray.1.subkey1": "golly",
    });

    expect(dot.flatten(obj, false)).to.eql({
      "simple": "simpleval",
      "nested.subkey": "subkeyval",
      "deep.deeper.deepest.deeperest": "deepestValue",
      "array": [{"subkey": "arraysubkeyval"},
                {"subkey1": "arraysubkeyval2"}],
      "subarray": [
        {"subarray": [{"subkey": "gosh"}, {"subkey1": "golly"}]}
      ]
    });
  });

  it("dot.flatten's with object values", function() {
    var date = new Date(2011,11,11);
    expect(dot.flatten({
      birthday: date
    })).to.eql({
      birthday: date
    });
  });

  it("dot.mongoReplacementModifier set unset", function() {
    expect(
      dot.mongoReplacementModifier(
        // keep
        {
          "_id": "mongoid",
          "a": 1,
          "deep": { 'deeper': { 'deepest': "ok" } }
        },
        // change
        {
          '_id': 'mongoid',
          'b': 1,
          'deep': { 'deeper': "enough", }
        }
    )).to.eql(
      // diff
      {
        $set: {
          'a': 1,
          'deep': { 'deeper': {'deepest': 'ok'}}
        },
        $unset: {
          'b': ''
        }
      }
    );
  });

});
