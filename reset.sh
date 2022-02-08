#!/bin/bash

echo "Remove node modules..."
rm -rf ./app/node_modules
rm -rf ./app/packages/web/.next
rm -rf ./app/packages/web/node_modules
rm -rf ./app/packages/commonlocal/.next
rm -rf ./app/packages/commonlocal/node_modules
rm -rf ./app/packages/checkout/.next
rm -rf ./app/packages/checkout/node_modules
