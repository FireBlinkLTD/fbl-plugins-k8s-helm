#!/bin/bash
set -e

# init cluster
bash test/assets/k8s-init.sh

# add helm chart repo
mkdir test/assets/helm/repo
helm package test/assets/helm/test --destination test/assets/helm/repo
helm repo index test/assets/helm/repo
http-server -p 9999 test/assets/helm/repo &
sleep 2
helm repo add localhost http://localhost:9999

echo "-> running tests"
cd /usr/app
yarn test
exit_code=$?
echo "<- tests execution completed"

# teardown cluster
bash test/assets/k8s-destroy.sh

echo "-> building ./coverage/coverage.lcov report file..."
./node_modules/.bin/nyc report --reporter=text-lcov > ./coverage/coverage.lcov
echo "-> ./coverage/coverage.lcov created"

exit $exit_code