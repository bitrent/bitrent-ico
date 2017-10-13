#!/usr/bin/env bash

./node_modules/.bin/solium --dir ./contracts
./node_modules/.bin/solcheck contracts/*