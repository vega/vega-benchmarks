var generators = (function() {

  function scatter(n, c) {
    var out = [];
    if (!n) n = params.N;
    if (!c) c = params.C;
    for (var i=0; i<n; ++i) {
      out.push({
        c: "c" + ~~(c*(i/n)),
        x: ~~(c * Math.random()),
        y: ~~(c * Math.random())
      });
    }
    return out;   
  }

  function pcp(n, c) {
    var out = [], o, i, j;
    if (!n) n = params.N;
    if (!c) c = params.C; 
    for (i=0; i<n; ++i) {
      out.push((o={
        c: "c" + ~~(c*(i/n))
      }));

      for (j=0; j<pcp.dims.length; ++j) {
        o[pcp.dims[j]] = ~~(c * Math.random());
      }
    }
    return out;
  }
  pcp.dims = Array.apply(null, Array(7)).map(function(d, i) { return "d"+i; });

  return {
    scatter: scatter,
    parallel_coords: pcp
  };
})();