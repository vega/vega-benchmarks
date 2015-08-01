var dl = require('datalib'),
  args = require('yargs')
    .usage('Usage $0 <generator> <N>')
    .demand(2)
    .argv;

function dimensions(n) {
  return Array.apply(null, Array(n)).map(function(d, i) { return "d"+i; });
}

function generate(dims) {
  if (dl.isNumber(dims)) dims = dimensions(dims);

  function g(n, c) {
    var out = [], o, i, j;
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
  for (var i=0, t = Date.now(); i<n; ++i) {
    out.push({
      date: t + (i * 1000 * 60 * 60 * 24),
      price: c * Math.random()
    });
  }
  return out;
}

function ids() {
  var N = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];
  var ids = [], seen = {}, id = 0;

  for (var i = 0; i < N.length; ++i) {
    for (var j = ids.length; j < N[i] * 0.1; ++j) {
      while (seen[id]) {
        id = ~~(Math.random() * N[i]);
      }

      ids.unshift(id);
      seen[id] = 1;
    }
  }

  return ids;
}

var generators = {
  scatter: generate(['x', 'y']),
  parallel_coords: generate(7),
  trellis: trellis,
  splom: generate(4),
  sp500: sp500,
  ids: ids
};

var gen = args._[0],
    N   = args._[1];

console.log(JSON.stringify(generators[gen](N, 50)));