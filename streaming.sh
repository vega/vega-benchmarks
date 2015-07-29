#!/bin/bash

for type in scatter parallel_coords trellis 
do
	for n in 100 200 500 1000 2000 5000 10000 20000 50000 100000 
	do
		for b in insert update remove 
		do
			printf "\n";
			for l in d3 vg2 vg1 
			do
				vis="streaming/$type/$l.html"

				if [ $l == 'd3' ]				
				then
					printf "$vis $b $n\n";
					./index.js $vis --benchmark $b -N $n
				else
					for r in svg canvas
					do
						printf "$vis $b $n $r\n"
						./index.js $vis --renderer $r --benchmark $b -N $n
					done
				fi
			done
		done
		printf "\n\nDONE N=$n\n\n";
	done
	printf "\n\nDONE type=$type\n\n";
done

