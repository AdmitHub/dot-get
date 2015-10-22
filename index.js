(function() {

var dot = {};

// Adapted from https://raw.githubusercontent.com/lodash/lodash/3.10.1/lodash.js
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}
function isDate(value) {
  return !!value && typeof value == 'object' && Object.prototype.toString.call(value) == '[object Date]';
}



/**
 * Look up the value specified by the dotpath on the given object.
 * @param {Object} object - The object to look things up on.
 * @param {string} dotpath - A mongo-style dotted path (e.g. "prop1.subdoc.0.foo").
 * @return {*|undefined} The value at the given path, or ``undefined`` if not found.
 */
dot.get = function(object, dotpath) {
  if (object === undefined || object === null) {
    return object;
  }
  var parts = dotpath.split(".");
  var obj = object;
  for (var i = 0; i < parts.length; i++) {
    if (/^\d+/.test(parts[i])) {
      obj = obj[parseInt(parts[i])];
    } else {
      obj = obj[parts[i]];
    }
    if (typeof obj === "undefined" || obj === null) {
      return undefined;
    }
  }
  return obj;
};
/**
 * Set the value given by the specified dotpath on the given object, creating
 * any intermediate objects or arrays as needed.
 * @param {Object} object - The object to set things on.
 * @param {String} dotpath - The path to set.
 * @param {*} value - The value to set.
 * @return {Object} The given object, modified in place.
 */
dot.set = function(object, dotpath, value) {
  // Given a mongo-style dotted path, set val to that path on obj.
  var parts = dotpath.split(".");
  var obj = object;
  for (var i = 0; i < parts.length - 1; i++) {
    var nextObj;
    if (/^\d+$/.test(parts[i + 1]) || parts[i + 1] === "$") {
      nextObj = [];
    } else {
      nextObj = {};
    }
    if (Array.isArray(obj)) {
      // handle intermediary array push
      var index = parts[i] === "$" ? obj.length : parseInt(parts[i]);
      obj = obj[index] ? obj[index] : (obj[index] = nextObj);
    } else {
      obj = obj[parts[i]] ? obj[parts[i]] : (obj[parts[i]] = nextObj);
    }
  }
  // handle terminal array push.
  var key = parts[parts.length - 1];
  if (key === "$" && Array.isArray(obj)) {
    key = obj.length;
  }
  obj[key] = value;
  return obj;
};

/**
 * Clear (delete) the value in object indicated by the given dotpath.
 * @param {Object} object - the object to delete things on
 * @param {String} dotpath - The path to clear (e.g. "field.subfield.0.gone")
 * @return {*|undefined} The value that was cleared, or undefined if the path
 * was already clear.
 */
dot.clear = function(object, dotpath) {
  var parts = dotpath.split(".");
  var obj = object;
  for (var i = 0; i < parts.length - 1; i++) {
    if (Array.isArray(obj)) {
      obj = obj[parseInt(parts[i])];
    } else {
      obj = obj[parts[i]];
    }
    if (typeof obj === "undefined") {
      return;
    }
  }
  var val;
  var index = parts[parts.length - 1];
  if (Array.isArray(obj)) {
    val = obj.splice(parseInt(index), 1)[0];
  } else {
    val = obj[index];
    delete obj[index];
  }
  return val;
};
/**
 * Given a nested object, return a single-level object where all keys are
 * dotted paths.
 * @param {Object} obj - An object to flatten
 * @return {Object} A one-level (non-nested) object where all keys are dotted
 * paths.
 * @example
 *  dotFlatten({
 *    simple: "arg",
 *    array: [
 *      {one: 1, two: 2},
 *      {three; 3, four: 4}
 *    ],
 *    deep: {
 *      deeper: {
 *        deepest: "still"
 *      }
 *    }
 *  })
 *  // yields:
 *  {
 *    "array.0.one": 1,
 *    "array.0.two": 2,
 *    "array.1.three": 3,
 *    "array.1.four": 4,
 *    "deep.deeper.deepest": "still",
 *    "simple": "arg"
 *  }
 */
dot.flatten = function(obj, flattenArrays) {
  flattenArrays = flattenArrays === undefined ? true : flattenArrays;
  function _flatten(obj, res, accumulatedKey) {
    if (Array.isArray(obj) && flattenArrays) {
      accumulatedKey = accumulatedKey ? accumulatedKey + "." : "";
      for (var i = 0; i < obj.length; i++) {
        _flatten(obj[i], res, accumulatedKey + i);
      }
    } else if (!Array.isArray(obj) && isObject(obj) && !isDate(obj)) {
      accumulatedKey = accumulatedKey ? accumulatedKey + "." : "";
      for (var key in obj) {
        _flatten(obj[key], res, accumulatedKey + key);
      }
    } else {
      res[accumulatedKey] = obj;
    }
    return res;
  }
  return _flatten(obj, {}, undefined);
};

/**
 * Create a mongo-style modifier, with {$set: ..., $unset: ...} from two *
 * complete objects.  The modifier returned would transform ``change`` into
 * ``keep``.
 *
 * @example
 *  var modifier = mongoReplacementModifier(
 *    latestDoc, collection.findOne(latestDoc._id)
 *  );
 *  collection.update(latestDoc._id, modifier);
 *
 * @param {Object} keep - The object to turn ``change`` into.
 * @param {Object} change - The object to be modified into ``keep``.
 * @return {Object} A mongo-style modifier document with $set and $unset.
 */
dot.mongoReplacementModifier = function(keep, change) {
  var $unset = {};
  for (var key in change) {
    if (keep[key] === undefined) {
      $unset[key] = "";
    }
  }
  var copy = {};
  for (var key in keep) {
    copy[key] = keep[key];
  }
  delete copy._id;
  return {$set: copy, $unset: $unset}
};

// Export for CommonJS, AMD, and browser global
if (typeof define === 'function' && define.amd) {
  // AMD
  define(function() {
    return dot;
  });
} else if (typeof module !== "undefined" && module.exports) {
  // CommonJS
  module.exports = dot;
} else {
  // Global, in-browser
  this.dot = dot;
}
})(this);
