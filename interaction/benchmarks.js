var benchmarks = (function() {

  var gen = params.generate_interactions, ops = []; // Generate or load interaction operations.
  var vis, targets, coords, current;

  function init(elements) {
    vis = d3.select(".marks").node();
    var bb = vis.getBoundingClientRect(),
        pad = (window.view) ? view.padding() : 0;

    if (params.renderer === "canvas") {
      // With canvas, elements are a list of scenegraph items. Offset their
      // positions relative to the visualization.
      targets = null;
      coords  = elements.map(function(e) { 
        return {
          left: e.x + bb.left + pad.left,
          right: e.x + bb.left + pad.left + e.width,
          top: e.y + bb.top + pad.top,
          bottom: e.y + bb.top + pad.top + e.height
        };
      });
    } else {
      // targets is a css selector.
      targets = d3.selectAll(elements)[0];
      // SPLOM cells are reversed in the Vega scenegraph.
      if (params.lib === 'd3' && window.location.pathname.match(/brushing_linking/)) {
        targets = targets.reverse();
      }

      coords  = targets.map(function(t) { 
        return t.getBoundingClientRect(); 
      });
    }

    if (gen) {
      ops.splice(0);
    } else {
      ops = ops.splice(0).concat(JSON.parse(dl.load({ url: 'data/interactions.json' })));
      params.R = ops.length;
    }
  }

  function interact(cb) {
    if (gen) {
      cb()
    } else {
      var op = ops.shift();
      current = op.current;
      mouseEvt(op.type, op.x, op.y, op.delta);
    }
  }


  function brush(s) {
    interact(function() {
      if (s % 2 === 0) {
        current = ~~(Math.random() * coords.length);
        randMouseEvt("mousedown");
      } else {
        randMouseEvt("mouseup");
      }
    }); 
  }

  // We want points to stay in the viewport, so zoom in the center and alternate
  // direction of panning. 
  var direction = 0;
  function panzoom(s) {
    current = 0;
    interact(function() {
      var c = coords[current],
          midw = (c.left + c.right)/2,
          midh = (c.top  + c.bottom)/2,
          ox = midw/2,
          oy = midh/2;

      if (s % 5 === 0 || s % 5 === 3) {
        mouseEvt("mousedown", midw, midh);
      } else if(s % 5 === 1 || s % 5 === 4) {
        if (direction === 0) {
          mouseEvt("mouseup", 
            dl.random.uniform(midw, midw+ox)(), dl.random.uniform(midh, midh+oy)());
          direction = 1;
        } else {
          mouseEvt("mouseup",
            dl.random.uniform(midw-ox, midw)(), dl.random.uniform(midh-oy, midh)());
          direction = 0;
        }
      } else {
        mouseEvt("wheel", midw, midh);
      }
    });
  }

  return { init: init, brush: brush, panzoom: panzoom, ops: ops };

  // -- helper functions -----

  function mouseEvt(type, x, y, delta) {
    // If svg, send the event directly to the target. If canvas, send to the vis elem.
    var target = targets ? targets[current || 0] : vis,
        evt, delta, init;

    var mm = document.createEvent("MouseEvents");
    mm.initMouseEvent("mousemove", true, true, window, null, x, y, x, y, false, false, false, false, target);

    if(type == "wheel") {
      delta = delta || dl.random.uniform(-10, 200)();

      // We can't seem to dispatch WheelEvents to SVG, so fake it with 
      // the detail of SVGZoomEvent.
      if (params.renderer === "svg") {
        evt = document.createEvent("SVGZoomEvent");
        evt.initUIEvent("wheel", true, true, window, delta);
      } else {
        init = { deltaX: delta, deltaY: delta, clientX: x, clientY: y, pageX: x, pageY: y }
        evt = new WheelEvent("wheel", init);
      }
    } else {
      evt = document.createEvent("MouseEvents");
      evt.initMouseEvent(type, true, true, window, null, x, y, x, y, false, false, false, false, target);
    }

    if (window.view) window.view._ts = Date.now();
    target.dispatchEvent(mm);

    if (window.view) window.view._ts = Date.now();
    target.dispatchEvent(evt);

    if (gen) ops.push({ type: type, x: x, y: y, delta: delta, current: current });
  };

  function randMouseEvt(type) {
    var c = coords[current],
        x = dl.random.uniform(c.left, c.right),
        y = dl.random.uniform(c.top, c.bottom);

    return mouseEvt(type, x(), y());
  }
})();