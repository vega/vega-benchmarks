// Injected by webdriverio or detected from URL.
if (!window.params) {
  var lib = window.location.pathname.match(/d3/) ? "d3" :
      window.location.pathname.match(/vg1/) ? "vg1" : "vg2";

  var params = window.location.search.slice(1)
    .split('&')
    .map(function(x) { return x.split('='); })
    .reduce(function(a, b) {
      a[b[0]] = b[1]; return a;
    }, {});

  params.R = +params.R || 1;
  params.N = +params.N || 100;
  params.C = +params.C || 50;
  params.P = +params.P || 0.01;
  params.lib = lib;
  params.renderer = lib === "d3" ? "svg" : (params.renderer || "canvas");
  params.benchmark = params.benchmark || "insert";
}

var benchmark = (function() {
  var lib = params.lib,
      op  = params.benchmark,
      R = params.R,
      s = 0,
      t = null;

  function log(results, op, t) {
    results.push({
      key: params.lib+" "+op,
      lib: params.lib,
      op:  op,
      renderer: params.renderer,
      time: Date.now() - t
    });
  }

  function svg(results, done) {
    d3.timer(function() {
      if (s === 0) {
        t = Date.now();
        init(function() { ++s; });
      } else if (s === 1) {
        log(results, "parsed", t);
        t = Date.now();
        update();
        ++s;
      } else if (s === 2) {
        log(results, "rendered", t);
        t = null;
        ++s;
      } else if (s <= R+2) {
        if (t) log(results, op, t);
        ops[op]();
        t = Date.now();
        update();
        log(results, op+" update returned", t);
        ++s;
      } else {
        log(results, op, t);
        return (done(results), true);
      }
    });
  }

  function canvas(results, done) {
    t = Date.now();
    init(function() {
      log(results, "parsed", t);
      t = Date.now();
      update();
      log(results, "rendererd", t);

      for (var i = 0; i<R; ++i) {
        ops[op]();
        t = Date.now();
        update();
        log(results, op, t);
      }

      return done(results);
    });
  }

  // return params.renderer === 'svg' ? svg : canvas;
  return svg;
})();