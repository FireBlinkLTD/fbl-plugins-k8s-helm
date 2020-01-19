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

if [[ -n "$KIND_COPY_KUBECONFIG_TO" ]]; then
    cp $KUBECONFIG $KIND_COPY_KUBECONFIG_TO
fi
