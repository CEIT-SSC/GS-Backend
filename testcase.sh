#!/bin/bash

if [ $# -ne 2 ]; then
    echo "Invalid argument; usage: $0 {problem_path} {user_id}"
    exit 1
fi
PROBLEM_PATH=$1
USER_ID=$2

echo "felan hichi" | sha1sum
