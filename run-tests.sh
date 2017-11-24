#!/usr/bin/env bash
# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the testrpc instance that we started (if we started one).
  if [ -n "$testrpc_pid" ]; then
    kill -9 $testrpc_pid
  fi
}

testrpc_running() {
  nc -z localhost 8444
}

if testrpc_running; then
  echo "Using existing testrpc instance"
else
  echo "Starting testrpc for test suite"
  # We define 10 accounts with balance 1M ether, needed for high-value tests.
  ./node_modules/.bin/testrpc --port 8444 \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501200,1000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501201,1000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501202,1000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501203,1000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501204,1000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501205,1000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501206,1000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501207,1000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501208,1000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501209,1000000000000000000000000"  \
  > /dev/null &
  testrpc_pid=$!
fi

./node_modules/.bin/truffle test ./test/1_PricingStrategy.js
./node_modules/.bin/truffle test ./test/2_RntCrowdsale.js
./node_modules/.bin/truffle test ./test/3_RntMultiSigWallet.js
./node_modules/.bin/truffle test ./test/4_RntPresaleEthereumDeposit.js
./node_modules/.bin/truffle test ./test/5_RntToken.js
./node_modules/.bin/truffle test ./test/6_RntTokenProxy.js
./node_modules/.bin/truffle test ./test/7_RntTokenVault.js
./node_modules/.bin/truffle test ./test/8_IntegrationTest.js