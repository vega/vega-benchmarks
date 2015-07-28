var benchmarks = (function() {

  var vis, targets, coords, current;

  function init(elements) {
    vis = d3.select(".marks").node();
    var bb = vis.getBoundingClientRect();

    if (params.renderer === "canvas") {
      // With canvas, elements are a list of scenegraph items. Offset their
      // positions relative to the visualization.
      targets = null;
      coords  = elements.map(function(e) { 
        return {
          left: e.x + bb.left,
          right: e.x + bb.left + e.width,
          top: e.y + bb.top,
          bottom: e.y + bb.top + e.height
        };
      });
    } else {
      // targets is a css selector.
      targets = d3.selectAll(elements)[0];
      coords  = targets.map(function(t) { 
        return t.getBoundingClientRect(); 
      });
    }
  }

  function brush(s) {
    if (s % 2 === 0) {
      current = s % coords.length;
      randMouseEvt("mousedown");
    } else {
      randMouseEvt("mouseup");
    }
  }

  function panzoom(s) {
    if (s % 3 === 0) {
      randMouseEvt("mousedown");
    } else if(s % 3 === 1) {
      randMouseEvt("mouseup");
    } else {
      current = s % coords.length;
      randMouseEvt("wheel");
    }
  }

  return { init: init, brush: brush, panzoom: panzoom };

  // -- helper functions -----

  function mouseEvt(type, x, y) {
    // If svg, send the event directly to the target. If canvas, send to the vis elem.
    var target = targets ? targets[current] : vis,
        evt, delta, init;

    var mm = document.createEvent("MouseEvents");
    mm.initMouseEvent("mousemove", true, true, window, null, x, y, x, y, false, false, false, false, target);

    if(type == "wheel") {
      delta = ~~(Math.random() * 2) ? 1 : -1;
      init = { deltaX: -delta, deltaY: -delta, clientX: x, clientY: y, pageX: x, pageY: y }
      evt = new WheelEvent("wheel", init);
    } else {
      evt = document.createEvent("MouseEvents");
      evt.initMouseEvent(type, true, true, window, null, x, y, x, y, false, false, false, false, target);
    }

    target.dispatchEvent(mm);
    target.dispatchEvent(evt);    
  };

  function randMouseEvt(type) {
    var c = coords[current],
        x = dl.random.uniform(c.left, c.right),
        y = dl.random.uniform(c.top, c.bottom);

    return mouseEvt(type, x(), y());
  }
})();