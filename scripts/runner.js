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

  params.N = +params.N || 100;  // Number of data tuples.
  params.C = +params.C || 50;   // Number of data categories.
  params.P = +params.P || 0.01; // % of data tuples to stream.
  params.R = +params.R || 1;    // Number of repetitions to perform.
  params.benchmark = params.benchmark || null; // Benchmark operation.
  params.generate_interactions = params.generate_interactions || false; // Generate new interactions?
  params.lib = lib;
  params.renderer = lib === "d3" ? "svg" : (params.renderer || "canvas");
}

// Disable retina rendering on canvas.
if (window.vg) window.vg.config.render.retina = false;

// If no benchmark, init and render the visualization once
window.onload = function() {
  if (!params.benchmark) init(function() { update(); });
};

// Get dimensions from data
function dimensions(data) {
  return dl.keys(data[0]).reduce(function(acc, k) { 
    if (k.match(/^d/)) acc.push(k);
    return acc;
  }, []);
}

var run = (function() {
  var lib = params.lib,
      op  = params.benchmark,
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
    results.push(dl.extend({}, params, {
      op: op,
      time: Date.now() - t
    }));
  }

  return function(results, done) {
    t = Date.now();
    init(function() {
      log(results, "parsed", t);
      d3.timer(function() {
        if (s === 0) {
          t = Date.now();
          update();
          ++s;
        } else if (s === 1) {
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
        } else if (s <= params.R+1) {
          if (t) log(results, op, t);
          if (benchmarks.rerender) {
            // For benchmark suites that require re-rendering, we measure
            // the time for the re-render (rather than the benchmark op).
            benchmarks[op](s);
            t = Date.now();
            update();
            log(results, op+" update returned", t);
            ++s;
          } else {
            // Otherwise, we measure the time taken by the benchmark op itself.
            t = Date.now();
            benchmarks[op](s);
            ++s;
          }
        } else {
          log(results, op, t);
          return (done(results), true);
        }
      });
    });
  }
})();