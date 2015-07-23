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

  return {
    scatter: scatter,
    parallel_coords: pcp,
    trellis: trellis
  };
})();