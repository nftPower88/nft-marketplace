#!/usr/bin/env bash

echo "Starting to deploy 'web', installing and bootstrapping..."
yarn&& yarn bootstrap

echo "Preparing 'common'..."
cd ./packages/common || exit
yarn prepare
cd ../checkout || exit

#echo "Preparing 'client'..."
#yarn prepare
#cd ../client || exit

echo "Preparing 'checkout'..."
yarn prepare
cd ../web || exit

echo "Prestarting 'web'..."
yarn prestart

echo "Building 'web'..."
# TODO: fix linting errors!
CI=false && yarn build
cd ..

echo "Done building 'web'"
