var benchmarks = (function() {
  var delta = JSON.parse(dl.load({ url: 'data/delta.json' })),
      ids   = JSON.parse(dl.load({ url: 'data/delta_ids.json' }));

  function getProp(data) {
    var prop = null;
    Object.keys(data[0]).some(function(p) {
      return data[0][p] && dl.isNumber(data[0][p]) && (prop = p);
    });
    return prop;
  };

  if (params.lib === "vg2") {
    // True streaming operations
    return {
      insert: function() {
        data.insert(delta.splice(0, params.N*params.P));
      },

      update: function() {
        var mod = {},
            len = params.N*params.P,
            where = function(d) { return d._id in mod; };

        while (Object.keys(mod).length < len) {
          mod[vals[ids.pop()]._id] = delta.pop();
        }

        var prop = getProp(vals);
        data.update(where, prop, function(d) { return mod[d._id][prop]; });
      },
      
      remove: function() {
        var rem = {},
            len = params.N*params.P,
            id  = 0;

        while (Object.keys(rem).length < len) {
          id = ids.pop();
          if (!id || id >= vals.length) id = vals.length - 1;
          rem[vals[id]._id] = 1;
        }

        data.remove(function(d) { return d._id in rem; });
      },

      rerender: true
    };
  } else {
    // D3 and Vg1 use batch streaming
    return {
      insert: function() {
        data = data.concat(delta.splice(0, params.N*params.P));
      },

      update: function() {
        var prop = getProp(data);
        for (var i = 0; i < params.N*params.P; ++i) {
          data[ids.pop()][prop] = delta.pop()[prop];
        }
      },
      
      remove: function() {
        for (var i = 0, id; i < params.N*params.P; ++i) {
          id = ids.pop();
          if (!id || id >= data.length) id = data.length - 1;
          data.splice(id, 1);
        }
      },

      rerender: true
    };
  }
})(); 