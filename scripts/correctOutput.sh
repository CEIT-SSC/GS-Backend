#!/bin/bash

if [ $# -ne 1 ]; then
    echo "Invalid argument; usage: $0 {relative_solution_file_address}"
    exit 1
fi
SOLUTION_ADDRESS=$1
INPUT=$(< /dev/stdin)

file=$(ls $SOLUTION_ADDRESS)
FILEDIR=${SOLUTION_ADDRESS%/*}
FILENAME=${FILEDIR%.*}

if [[ $file == *.py  ]]; then
    echo -e "$INPUT" | python3 "$SOLUTION_ADDRESS"
elif [[ $file == *.java ]]; then
#    MODIFICATION_DATE=$(stat -c %Y "$GENERATOR.java")
#    CURRENT_TIME=$(date +"%s")
#    AGE=$(( CURRENT_TIME-MODIFICATION_DATE ))
    if ! [[ -e "$FILEDIR/$FILENAME.class" ]]; then
        javac "$SOLUTION_ADDRESS"
    fi

#    if [[ AGE -gt 60 ]]; then
#        javac "$GENERATOR.java"
#    fi

    echo -e "$INPUT" | java -cp "$FILEDIR" "$FILENAME"
fi

