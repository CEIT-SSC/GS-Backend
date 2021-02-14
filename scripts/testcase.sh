#!/bin/bash

if [ $# -ne 2 ]; then
    echo "Invalid argument; usage: $0 {problem_id} {user_id}"
    exit 1
fi
QUESTION_PATH=$1
USER_ID=$2

python3 $QUESTION_PATH $USER_ID