#!/bin/sh

DT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../.."
if [ "$1" = "debug" ]; then
    DEBUG="debug"
else
    OUT_DIR=$1
    DEBUG=$2
fi

# If not run from DataTables build script, redirect to there
if [ -z "$DT_BUILD" ]; then
    cd $DT_DIR/build
    ./make.sh extension SearchPanes $DEBUG
    cd -
    exit
fi

# Change into script's own dir
cd $(dirname $0)

DT_SRC=$(dirname $(dirname $(pwd)))
DT_BUILT="${DT_SRC}/built/DataTables"
. $DT_SRC/build/include.sh

# Copy CSS
rsync -r css $OUT_DIR
css_frameworks searchPanes $OUT_DIR/css

if [ ! -d "node_modules" ]; then
    npm install
fi

if [ ! -d "node_modules/@rollup" ]; then
    npm install
fi

# Copy images
#rsync -r images $OUT_DIR

# FASTER
node_modules/typescript/bin/tsc

#SLOWER
# node_modules/typescript/bin/tsc src/searchPanes.ts --module ES6
# node_modules/typescript/bin/tsc src/searchPane.ts --module ES6
# node_modules/typescript/bin/tsc src/index.ts --module ES6
# node_modules/typescript/bin/tsc src/paneType.ts --module ES6
# node_modules/typescript/bin/tsc src/panesType.ts --module ES6
# node_modules/typescript/bin/tsc src/searchPanes.dataTables.ts --module ES6
# node_modules/typescript/bin/tsc src/searchPanes.bootstrap4.ts --module ES6
# node_modules/typescript/bin/tsc src/searchPanes.bootstrap.ts --module ES6
# node_modules/typescript/bin/tsc src/searchPanes.foundation.ts --module ES6
# node_modules/typescript/bin/tsc src/searchPanes.jqueryui.ts --module ES6
# node_modules/typescript/bin/tsc src/searchPanes.semanticui.ts --module ES6

# Copy JS
HEADER="$(head -n 3 src/index.ts)"

rsync -r src/*.js $OUT_DIR/js
js_frameworks searchPanes $OUT_DIR/js "jquery datatables.net-FW datatables.net-searchpanes"

OUT=$OUT_DIR ./node_modules/.bin/rollup $OUT_DIR/js/index.js \
    --banner "$HEADER" \
    --config rollup.config.js
    

rm \
    $OUT_DIR/js/index.js \
    $OUT_DIR/js/panesType.js \
    $OUT_DIR/js/paneType.js \
    $OUT_DIR/js/SearchPane.js \
    $OUT_DIR/js/SearchPaneST.js \
    $OUT_DIR/js/SearchPanes.js \
    $OUT_DIR/js/SearchPanesST.js \
    $OUT_DIR/js/SearchPaneCascade.js \
    $OUT_DIR/js/SearchPaneViewTotal.js \
    $OUT_DIR/js/SearchPaneCascadeViewTotal.js \
    src/*.js \
    # src/*.d.ts

rm src/*.d.ts

# Copy Types
if [ -d $OUT_DIR/types ]; then
	rm -r $OUT_DIR/types		
fi
mkdir $OUT_DIR/types

cp types/* $OUT_DIR/types

js_wrap $OUT_DIR/js/dataTables.searchPanes.js "jquery datatables.net"

# Copy and build examples
rsync -r examples $OUT_DIR
examples_process $OUT_DIR/examples

# Readme and license
cp Readme.md $OUT_DIR
cp License.txt $OUT_DIR

