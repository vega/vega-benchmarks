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

// Disable retina rendering on canvas (vg2 only).
if (window.vg) window.vg.config.render.retina = false;

var benchmark = (function() {
  var lib = params.lib,
      op  = params.benchmark,
      R = params.R,
      s = 0,
      t = null;

  // Shim the vega View components to get times of processing/dataflow vs. rendering.
  function shimVg1View(view, results) {
    view._ts = null;
    if (!view.update._shimmed) {
      var up = view.update.bind(view);
      view.update = function(opt) {
        view._ts = Date.now();
        return up(opt);
      };

      var render = view.render.bind(view);
      view.render = function(items) {
        log(results, "processing complete", view._ts);
        view._ts = Date.now();
        render(items);
        log(results, "rendering complete", view._ts);
        return view;
      };
    }

    view.update._shimmed = true;    
  }

  function shimVg2View(view, results) {
    view._ts = null;
    if (!view.update._shimmed) {
      var up = view.update.bind(view);
      view.update = function(opt) {
        view._ts = Date.now();
        return up(opt);
      };

      var evl = view._renderNode.evaluate.bind(view._renderNode);
      view._renderNode.evaluate = function(input) {
        log(results, "dataflow complete", view._ts);
        view._ts = Date.now();
        input = evl(input);
        log(results, "rendering complete", view._ts);
        return input;
      };
    }

    view.update._shimmed = true;
  }

  function log(results, op, t) {
    results.push({
      key: params.lib+" "+op,
      lib: params.lib,
      op:  op,
      renderer: params.renderer,
      time: Date.now() - t
    });
  }

  function run(results, done) {
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
        if (window.view) {
          if (vg.version.match(/1.5/)) {
            shimVg1View(window.view, results);
          } else if (vg.version.match(/2.0/)) {
            shimVg2View(window.view, results);
          }
        }
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

  return run;
})();