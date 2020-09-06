#!/bin/bash
set -e

# init cluster
bash test/assets/k8s-init.sh

# add helm chart repo
mkdir -p test/assets/helm/repo
helm package test/assets/helm/test --destination test/assets/helm/repo
helm repo index test/assets/helm/repo
http-server -p 9999 test/assets/helm/repo &

mkdir -p test/assets/helm/repo-v2
helm_v2 package test/assets/helm/test-v2 --destination test/assets/helm/repo-v2
helm_v2 repo index test/assets/helm/repo-v2
http-server -p 9988 test/assets/helm/repo-v2 &

sleep 2
helm repo add localhost http://localhost:9999
helm_v2 repo add localhost http://localhost:9988

echo "-> running tests"
cd /usr/app
yarn test
#yarn test:mocha
exit_code=$?
echo "<- tests execution completed"

# teardown cluster
bash test/assets/k8s-destroy.sh

echo "-> building ./coverage/coverage.lcov report file..."
./node_modules/.bin/nyc report --reporter=text-lcov > ./coverage/coverage.lcov
echo "-> ./coverage/coverage.lcov created"

exit $exit_code
