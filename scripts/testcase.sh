#!/bin/bash

if [ $# -ne 2 ]; then
    echo "Invalid argument; usage: $0 {problem_id} {user_id}"
    exit 1
fi
SOLUTION_ADDRESS=$1
USER_ID=$2

file=$(ls $SOLUTION_ADDRESS)
FILEDIR=${SOLUTION_ADDRESS%/*}
base=${SOLUTION_ADDRESS##*/}
FILENAME=${base%.*}

if [[ $file == *.py ]]; then
    python3 $SOLUTION_ADDRESS $USER_ID
elif [[ $file == *.sh ]]; then
    /bin/bash -c "$SOLUTION_ADDRESS $USER_ID"
fi
