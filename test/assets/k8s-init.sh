#!/bin/bash
set -e

EXISTING_CLUSTERS=$(kind get clusters)

if [[ $KIND_USE_EXISTING_CLUSTER == 0 ]]; then
    if [[ "${EXISTING_CLUSTERS}x" != "x" ]]; then
      echo "-> removing kind cluster..."
      kind delete cluster
      echo "<- kind cluster removed"
    fi

    echo "-> creating kind cluster..."
    kind create cluster

    exit_code=$?
    if [[ $exit_code != 0 ]]; then
        echo "<- failed to create kind cluster"
        exit $exit_code
    fi
    echo "<- kind cluster created"
fi

if [[ -z "$KUBECONFIG" ]]; then
    kind get kubeconfig > ~/.kube/config
else
  # copy kubeconfig into default location for test purposes
  cp $KUBECONFIG ~/.kube/config
fi

echo "-> installing tiller..."
helm_v2 init --wait --force-upgrade
kubectl create serviceaccount --namespace kube-system tiller
kubectl create clusterrolebinding tiller-cluster-rule --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
kubectl patch deploy --namespace kube-system tiller-deploy -p '{"spec":{"template":{"spec":{"serviceAccount":"tiller"}}}}'
echo "<- tiller installed"

sleep 30

echo "-> waiting for tiller to boot..."
until helm_v2 version > /dev/null
do
  echo "sleeping..."
  sleep 1
done
echo "<- tiller started"

if [[ -n "$KIND_COPY_KUBECONFIG_TO" ]]; then
    cp $KUBECONFIG $KIND_COPY_KUBECONFIG_TO
fi
