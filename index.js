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
  .usage('Usage: $0 <visualization> [options]')
  .demand(1)
  .string('benchmark').demand('benchmark')
  .describe('benchmark', 'Benchmark operation to run.')
  .string('renderer')
  .describe('renderer', 'Vega renderer (canvas or svg).')
  .default('renderer', 'canvas')
  .describe('R', 'Number of repetitions to perform.')
  .default('R', 10)
  .describe('N', 'Number of data tuples.')
  .default('N', 100)
  .describe('C', 'Number of data categories.')
  .default('C', 50)
  .describe('P', '% of data tuples to stream.')
  .default('P', 0.01)
  .help('help')
  .argv;

var server = require('node-http-server')
  .deploy();

var name = args._[0].replace(/\//g, '-').replace(/-(d3|vg1|vg2).html/, ''),
    results = getResults(name),
    params = JSON.parse(JSON.stringify(args));

// Clean up yargs and make them URL params.
['_', '$0', 'help'].forEach(function(k) { delete params[k]; });
params = Object.keys(params).map(function(k) { 
  return k+'='+params[k]; 
}).join('&');

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
  .url('http://localhost:8080/'+args._[0]+'?'+params)
  .timeoutsAsyncScript(3000000)
  .executeAsync(function(args, results, done) {
    benchmark(results, done);
  }, args, results)
    .then(function(ret)  { 
      saveResults(name, ret.value); 
      server.close();
    })
    .catch(function(err) { console.err('RUNNER ERROR', err.message); })
  .end();