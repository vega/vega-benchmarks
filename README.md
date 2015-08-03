# vega-benchmarks

Scripts to benchmark [Vega's](http://github.com/vega/vega) performance.

## Results

![Streaming benchmarks](http://vega.github.io/vega/images/benchmarks/streaming.png)

Average performance of rendering (non-interactive) streaming visualizations: (top-bottom) scatterplot, parallel coordinates, and trellis plot; (left-right) initialization time, average frame time, and average frame rate. Dashed lines indicate the threshold of interactive updates.

![Interaction benchmarks](http://vega.github.io/vega/images/benchmarks/interaction.png)

Average frame rates for three interactive visualizations: (left-right) brushing and linking on a scatterplot matrix; brushing and linking on an overview+detail visualization; panning and zooming on a scatterplot. Dashed lines indicate the threshold of interactive updates.

## Benchmark Process

```
Usage: ./index.js <visualization> [options]

Options:
  --benchmark  Benchmark operation to run.                   [string] [required]
  --renderer   Vega renderer (canvas or svg).       [string] [default: "canvas"]
  -R           Number of repetitions to perform.                   [default: 10]
  -N           Number of data tuples.                             [default: 100]
  -C           Number of data categories.                          [default: 50]
  -P           % of data tuples to stream.                       [default: 0.01]
  --help       Show help                                               [boolean]
```

1. Run `npm install` in the benchmarks directory, and then `npm start`.

2. Individual benchmarks can be run via the `index.js` script. See usage help text above.

3. Benchmark suites, as reported in the paper, are available via the
`streaming.sh` and `interaction.sh` bash scripts. 

4. Results concatenated against existing results found in the `results/raw` folder. By default, we included the results reported in the paper. Clearing these results will generate new files instead.

5. A script to summarize raw results is provided for convenience (`scripts/summary.js`).
