#!/bin/bash

if [ -f .super.env ]
then
  export $(cat .super.env | sed 's/#.*//g' | xargs)
fi

node ./createSuperman.js