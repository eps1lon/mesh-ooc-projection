color regex:

\d+ [0-9\-\.]+ [0-9\-\.]+ [0-9\-\.]+ [0-9\-\.]+

 npm run ooc:regular -- -f ../tmp/eisriesenwelt/EisriesenWelt10PercentD12.off -r 30 -o ../tmp/ooc30D12
 npm run project:regular -- -f ../tmp/eisriesenwelt/EisriesenweltSegmentationVisualization.off  --res 30 -o ../tmp/ooc30D12/ --high-poly-vertices 2791167
--indices-file ../tmp/eisriesenwelt/eisriesenwelt.surfseg

d12: 2791167
d13: 11012912

node --max-old-space-size=1024 lib/cli/main.js --low-poly-file ../tmp/eisriesenwelt/EisriesenweltSegmentationVisualization.off --high-poly-file ../tmp/eisriesenwelt/EisriesenWelt10PercentD12.off --indices-file ../tmp/eisriesenwelt/eisriesenwelt.surfseg --grid-resolution-max 30 --ooc-dir ../tmp/ooc30D12/ > eisriesenwelt30D12.log 2>&1

node --max-old-space-size=1024 lib/cli/main.js --low-poly-file ../tmp/carlsbad/segmented.off --high-poly-file '../tmp/carlsbad/Carlsbad - full scan.off' --indices-file ../tmp/carlsbad/segmented.surfseg --grid-resolution-max 30 --ooc-dir ../tmp/ooc30carlsbad/ > carlsbad30.log 2>&1