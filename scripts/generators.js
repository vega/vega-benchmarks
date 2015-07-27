var generators = (function() {

  function dimensions(n) {
    return Array.apply(null, Array(n)).map(function(d, i) { return "d"+i; });
  }

  function generate(dims) {
    if (dl.isNumber(dims)) dims = dimensions(dims);

    function g(n, c) {
      var out = [], o, i, j;
      if (!n) n = params.N;
      if (!c) c = params.C; 
      for (i=0; i<n; ++i) {
        out.push((o={
          c: "c" + ~~(c*(i/n))
        }));

        for (j=0; j<dims.length; ++j) {
          o[dims[j]] = ~~(c * Math.random());
        }
      }
      return out;   
    }

    return (g.dims = dims, g);
  }

  function trellis(n, c) {
    var out = [];
    if (!n) n = params.N;
    if (!c) c = params.C;
    for (var i=0; i<n; ++i) {
      out.push({
        variety: "v" + ~~((c/5) * Math.random()), 
        site: "s" + ~~((c/10) * Math.random()),
        year: ~~(2 * Math.random()),
        yield: ~~(c * Math.random())
      });
    }
    return out;
  }

  function sp500(n, c) {
    var out = [];
    if (!n) n = params.N;
    if (!c) c = params.C;
    for (var i=0, t = Date.now(); i<n; ++i) {
      out.push({
        date: t + (i * 1000 * 60 * 60 * 24),
        price: c * Math.random()
      });
    }
    return out;
  }

  return {
    scatter: generate(['x', 'y']),
    parallel_coords: generate(7),
    trellis: trellis,
    splom: generate(4),
    sp500: sp500
  };
})();