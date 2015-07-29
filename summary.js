var fs = require('fs'),
	dl = require('datalib'),
	args = require('yargs').argv;

var raw = JSON.parse(fs.readFileSync(args._[0])),
	res = raw.filter(function(d) {
		return !d.op.match(/parsed|rendered|complete|return/g);
	});

var agg = dl.groupby(['lib', 'renderer', 'op', 'N'])
	.summarize({ time: ['mean', 'stdev'] });

console.log(dl.print.table(agg.execute(res)));