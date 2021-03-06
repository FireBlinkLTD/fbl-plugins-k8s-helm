# Test Helm Chart Release

Action handler that allows to test the release.

**ID:** `com.fireblink.fbl.plugins.k8s.helm.test`

**Aliases:**

- `fbl.plugins.k8s.helm.test`
- `k8s.helm.test`
- `helm.test`

## Syntax:

```yaml
pipeline:
  helm.test:
    # [optional] Custom helm binary name/path
    # Default value: helm
    binary: 'helm_v3'

    # [required] Release name.
    release: 'string'

    # [optional] Time in seconds to wait for any individual Kubernetes operation (like Jobs for hooks).
    # Default value: 300
    timeout: 60

    # [optional] Enable verbose output.
    # Default value: false
    debug: true

    # [optional] List of extra arguments to append to the command.
    # Refer to `helm help delete` for all available options
    extra:
      - --tiller-namespace
      - kube-system
```
