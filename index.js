#!/usr/bin/env node
var fs = require('fs');

function getResults(name) {
  try {
    var r = JSON.parse(fs.readFileSync('results/raw/'+name+'.json').toString());
    return r != null ? (Array.isArray(r) ? r : [r]) : [];
  } catch(e) {
    return [];
  }
}

function saveResults(name, results) {
  fs.writeFileSync('results/raw/'+name+'.json', JSON.stringify(results, null, 2));
}

var args = require('yargs')
  .usage('Usage: $0 [options]')
  .string('l').alias('l', 'lib')
  .describe('l', 'Visualization library (d3, vg1, vg2)')
  .string('v').alias('v', 'visualization')
  .describe('v', 'Visualization to benchmark')
  .string('b').alias('b', 'benchmark')
  .string('r').alias('r', 'renderer')
  .describe('r', 'Vega renderer (canvas or svg)')
  .default('r', 'canvas')
  .describe('b', 'Benchmark operation to run')
  .describe('R', 'Number of repetitions to perform')
  .default('R', 10)
  .describe('N', 'Number of data tuples')
  .default('N', 100)
  .describe('C', 'Number of data categories')
  .default('C', 50)
  .describe('P', '% of data tuples to stream')
  .default('P', 0.01)
  .help('h').alias('h', 'help')
  .demand(['lib', 'visualization', 'benchmark'])
  .argv;

var server = require('node-http-server')
  .deploy();

var results = getResults(args.visualization);

var client = require('webdriverio')
  .remote({
    desiredCapabilities: {
      browserName: 'chrome',
      chromeOptions: {
        args: ['--enable-precise-memory-info']
      }
    }
  })
  .init()
  .url('http://localhost:8080/'+args.lib+'/'+args.visualization+'.html')
  .timeoutsAsyncScript(3000000)
  .executeAsync(function(args, results, done) {
    this.params = args; // params for generators and runners
    benchmark(results, done);
  }, args, results)
    .then(function(ret)  { 
      saveResults(args.visualization, ret.value); 
      server.close();
    })
    .catch(function(err) { console.err('RUNNER ERROR', err.message); })
  .end();