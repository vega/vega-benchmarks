var fs = require('fs'),
	dl = require('datalib'),
	args = require('yargs').argv;

var raw = JSON.parse(fs.readFileSync(args._[0])).filter(function(d) {
		return !d.op.match(/complete|return/g);
	});

var agg = dl.groupby(['lib', 'renderer', 'op', 'N'])
	.summarize({ time: ['mean', 'stdev'] });

var summary = agg.execute(raw);

// Sum "parsed" and "rendered" into a single "init"
// and average streaming ops into a single "streaming".
var init = {}, streaming = {},
    d;

for (var i = 0; i < summary.length; ++i) {
  d = summary[i];

  if (d.op === 'parsed') {
    init[d.lib+'_'+d.renderer] = dl.extend({}, d, {op: 'init'});
  } else if (d.op === 'rendered') {
    init[d.lib+'_'+d.renderer].mean_time += d.mean_time; 
  } else if (d.op === 'insert') {
    streaming[d.lib+'_'+d.renderer] = dl.extend({}, d, {op: 'streaming'});
  } else if (d.op === 'update' || d.op === 'remove') {
    streaming[d.lib+'_'+d.renderer].mean_time += d.mean_time;
  }

  // We've hit a new boundary, so store previous init and streaming
  if (i === summary.length - 1 || d.N !== summary[i+1].N) {
    if (init !== null && streaming !== null) {
      init = dl.keys(init).reduce(function(acc, k) {
        return (acc.push(init[k]), acc);
      }, []);

      streaming = dl.keys(streaming).reduce(function(acc, k) {
        streaming[k].mean_time /= 3;
        return (acc.push(streaming[k]), acc);
      }, []);

      summary.splice.apply(summary, [++i, 0].concat(init, streaming));
      i += init.length + streaming.length - 1;
    }

    N = d.N;
    init = {};
    streaming = {};
  }
}

// D3 and VG1 baselines
var d3 = summary.filter(function(d) { return d.lib === 'd3' })
  .reduce(function(acc, d) { return (acc[d.op+'_'+d.N] = d, acc); }, {});

var vg1 = summary.filter(function(d) { return d.lib === 'vg1' })
  .reduce(function(acc, d) { return (acc[d.op+'_'+d.N+'_'+d.renderer] = d, acc); }, {});

summary.forEach(function(d) {
  d.d3Factor = d3[d.op+'_'+d.N].mean_time / d.mean_time;
  d.vg1Factor = vg1[d.op+'_'+d.N+'_'+d.renderer].mean_time / d.mean_time;
  d.fps = 1000/d.mean_time;
});

console.log(dl.print.table(summary));

summary = summary.filter(function(d) {
  return !d.op.match(/parse|render|insert|update|remove/g);
});
fs.writeFileSync(args._[0].replace('raw', 'summary'), JSON.stringify(summary, null, 2));