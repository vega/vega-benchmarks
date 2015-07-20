var tasks = (function() {

  var getProp = function(data) {
    var prop = null;
    Object.keys(data[0]).some(function(p) {
      return dl.isNumber(data[0][p]) && (prop = p);
    });
    return prop;
  };

  var batchStreaming = {
    insert: function() {
      data = data.concat(gen(params.N*params.P));
    },

    update: function() {
      var prop = getProp(data);
      for (var i = 0; i < params.N*params.P; ++i) {
        data[Math.floor(Math.random() * data.length)][prop] = gen(1)[0][prop];
      }
    },
    
    remove: function() {
      for (var i = 0; i < params.N*params.P; ++i) {
        data.splice(Math.floor(Math.random() * data.length), 1);
      }
    }
  };

  var streaming = {
    insert: function() {
      data.insert(gen(params.N*params.P));
    },

    update: function() {
      var mod = {},
          len = params.N*params.P,
          where = function(d) { return d._id in mod; };

      while (Object.keys(mod).length < len) {
        mod[vals[Math.floor(Math.random() * vals.length)]._id] = gen(1)[0];
      }

      var prop = getProp(vals);
      data.update(where, prop, function(d) { return mod[d._id][prop]; });
    },
    
    remove: function() {
      var rem = {},
          len = params.N*params.P;

      while (Object.keys(rem).length < len) {
        rem[vals[Math.floor(Math.random() * vals.length)]._id] = 1;
      }

      data.remove(function(d) { return d._id in rem; });
    }
  };

  return {
    batchStreaming: batchStreaming,
    streaming: streaming
  };
})();