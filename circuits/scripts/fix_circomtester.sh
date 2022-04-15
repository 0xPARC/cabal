#!/bin/bash
# Patches circom_tester v0.0.10+ to work
# Replaces all instances of invoking `circom` with `circom2`
echo "Updating circom_tester package to exec circom2 instead of circom1"
sed -i'' -e 's/circom /circom2 /g' ./node_modules/circom_tester/wasm/tester.js
