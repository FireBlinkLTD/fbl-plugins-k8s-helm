# FBL Plugins: K8s Helm

Install, Update, Delete helm chart releases with ease in your [fbl](https://fbl.fireblink.com) flows.

[![CircleCI](https://circleci.com/gh/FireBlinkLTD/fbl-plugins-k8s-helm.svg?style=svg)](https://circleci.com/gh/FireBlinkLTD/fbl-plugins-k8s-helm)
[![Greenkeeper badge](https://badges.greenkeeper.io/FireBlinkLTD/fbl-plugins-k8s-helm.svg)](https://greenkeeper.io/)
[![codecov](https://codecov.io/gh/FireBlinkLTD/fbl-plugins-k8s-helm/branch/master/graph/badge.svg)](https://codecov.io/gh/FireBlinkLTD/fbl-plugins-k8s-helm)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/FireBlinkLTD/fbl-plugins-k8s-helm.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/FireBlinkLTD/fbl-plugins-k8s-helm/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/FireBlinkLTD/fbl-plugins-k8s-helm.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/FireBlinkLTD/fbl-plugins-k8s-helm/context:javascript)

## Purpose

[fbl](https://fbl.fireblink.com) is a **flow** automation tool. That generally means it can automate any kind of routine processes and allows to create some really complex combinations of actions, even non related to deployment (probably, the main reason why you're currently reading this now).

While cluster deployment is in some cases really simple and some PaaS providers already support cluster creation withing few commands / mouse clicks, service deployment into the cluster is not trivial like that.

At FireBlink we generally treat entire cluster as a single product. As any other software product update of any of its dependencies may lead to unexpected behaviour. We never trust 3rd party vendors to have backward compatibility. So the only way we can be sure that all the services will work consistantly across environment is lock of the versions.

As cluster is a product, it has it's own version, migration scripts, and set of helm/kubectl commands required to stand up / update the cluster.

To help with that 2 main plugins for FBL has been created:

- [@fbl-plugins/k8s-kubectl](https://github.com/FireBlinkLTD/fbl-plugins-k8s-kubectl) - allows to create/update/delete ConfigMaps, Secrets, CRDs, etc.
- [@fbl-plugins/k8s-helm](https://github.com/FireBlinkLTD/fbl-plugins-k8s-helm) - install/update or delete of helm releases

Generally both plugins are used together, as Secrets should be created outside the helm chart.

Sensitive information can be hosted inside the Git repo and encrypted with [@fbl-plugins/crypto](https://github.com/FireBlinkLTD/fbl-plugins-crypto).

Flexibility of the deployment is the key concept of FBL and plugins, as we never know what challenges we need to resolve the following day.

## Examples

Check [fbl-examples](https://github.com/FireBlinkLTD/fbl-examples) repository for usage examples.

## Integration

There are multiple ways how plugin can be integrated into your flow.

### package.json

This is the most recommended way. Create `package.json` next to your flow file with following content:

```json
{
  "name": "flow-name",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "fbl": "fbl"
  },
  "license": "UNLICENSED",
  "dependencies": {
    "@fbl-plugins/k8s-helm": "1.1.1",
    "fbl": "1.12.0"
  }
}
```

Then you can install dependencies as any other node module `yarn install` depending on the package manager of your choice.

After that you can use `yarn fbl <args>` to execute your flow or even register a custom script inside "scripts".

### Global installation

`npm i -g @fbl-plugins/k8s-helm`

### Register plugin to be accessible by fbl

- via cli: `fbl -p @fbl-plugins/k8s-helm <args>`
- via flow:

```yaml
requires:
  fbl: '>=1.12.0 <2.0.0'
  plugins:
    '@fbl-plugins/k8s-helm': '>=1.1.1'

pipeline:
  # your flow goes here
```

## Action Handlers

- [helm update --install](./docs/UpdateOrInstall.md)
- [helm delete](./docs/Delete.md)
- [helm test](./docs/Test.md)
- [helm repo add](./docs/RepoAdd.md)
