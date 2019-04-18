# FBL Plugins: K8s Helm

Install, Update, Delete helm chart releases with ease in your [fbl](https://fbl.fireblink.com) flows.

[![CircleCI](https://circleci.com/gh/FireBlinkLTD/fbl-plugins-k8s-helm.svg?style=svg)](https://circleci.com/gh/FireBlinkLTD/fbl-plugins-k8s-helm)
[![Greenkeeper badge](https://badges.greenkeeper.io/FireBlinkLTD/fbl-plugins-k8s-helm.svg)](https://greenkeeper.io/) 
[![codecov](https://codecov.io/gh/FireBlinkLTD/fbl-plugins-k8s-helm/branch/master/graph/badge.svg)](https://codecov.io/gh/FireBlinkLTD/fbl-plugins-k8s-helm)

## Purpose

[fbl](https://fbl.fireblink.com) is a **flow** automation tool. That generally means it can automate any kind of routine processes and allows to create some really complex combinations of actions, even non related to deployment itself.

With this plugin you can describe the entire cluster state you need to have, design your dependencies across helm charts (DB + backend + frontend + ingress configuration), run extra scripts before, after, in the middle of your deployment, run deployment in parallel, in a sequence, in the way you need it to be executed.

Share senvitive information via fbl secrets that will never leak to the execution logs. Store them inside git repository for convinience and securelly inside encrypted vault (check [@fbl-plugins/crypto](https://github.com/FireBlinkLTD/fbl-plugins-crypto)).

Be flexible - that is what FBL is designed for.

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
    "@fbl-plguins/k8s-helm": "1.0.0",
    "fbl": "1.7.0"
  }
}
```

Then you can install dependencies as any other node module `yarn install` depending on the package manager of your choice.

After that you can use `yarn fbl <args>` to execute your flow or even register a custom script inside "scripts".

### Global installation

`npm i -g @fbl-plguins/k8s-helm`

### Register plugin to be accessible by fbl

- via cli: `fbl -p @fbl-plguins/k8s-helm <args>`
- via flow:

```yaml
requires:
  fbl: '>=1.7.0'
  plugins:
    '@fbl-plguins/k8s-helm': '>=1.0.0'
    
pipeline:
  # your flow goes here
```

## Action Handlers

* [Delete](./docs/Delete.md)
* [Test](./docs/Test.md)
* [Update or Install](./docs/UpdateOrInstall.md)

