#!/usr/bin/env bash
set -e
ROOT=$(dirname "$0")/..
cd "$ROOT"

echo "Running build benchmarks..."
/usr/bin/time -f '%E real' mage build >/tmp/mage-build.log 2>&1
cat /tmp/mage-build.log

/usr/bin/time -f '%E real' docker build -f Dockerfile -t vikunja-bench . >/tmp/docker-build.log 2>&1
cat /tmp/docker-build.log

echo "Benchmark logs stored." 

