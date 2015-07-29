#!/bin/bash

for type in brushing_linking overview_detail panzoom 
do
	for n in 100 200 500 1000 2000 5000 10000
	do
		if [ $type == 'panzoom' ]
		then
			b="panzoom"
		else
			b="brush"
		fi
		printf "\n";
		for l in d3 vg2 vg1
		do
			vis="interaction/$type/$l.html"

			if [ $l == 'd3' ]				
			then
				printf "$vis $b $n\n";
				./index.js $vis --benchmark $b -N $n -R 100
			else
				for r in svg canvas
				do
					printf "$vis $b $n $r\n"
					./index.js $vis --renderer $r --benchmark $b -N $n -R 100
				done
			fi
		done
	done
	printf "\n\nDONE type=$type\n\n";
done

