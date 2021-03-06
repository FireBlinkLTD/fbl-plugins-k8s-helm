# Update or Install Helm Chart (for Helm V2)

Action handler that allows to install new / update existing helm chart release.

**ID:** `com.fireblink.fbl.plugins.k8s.helm.upgrade.v2`

**Aliases:**

- `fbl.plugins.k8s.helm.upgrade.v2`
- `fbl.plugins.k8s.helm.install.v2`
- `k8s.helm.upgrade.v2`
- `k8s.helm.install.v2`
- `helm.upgrade.v2`
- `helm.install.v2`

## Syntax:

```yaml
pipeline:
  helm.install.v2:
    # [optional] Custom helm binary name/path
    # Default value: helm
    binary: 'helm_v2'

    # [required] Release name.
    release: 'string'

    # [required} Chart name or local path (absolute or relative to the flow file).
    chart: 'repo/chart'

    # [optional] Specify the exact chart version to use. If this is not specified,
    # the latest version is used (works only for charts referenced from repositories).
    version: '1.0.0'

    # [optional] K8s namespace into which to install the release.
    # Default value: `default`
    namespace: 'main'

    # [optional] extra variables to override / exted default helm chart values
    variables:
      # [optional] list of files to use as sources for values
      files:
        - assets/chart_values.yml

      # [optional] list of files that are EJS templates (both FBL global and local delimiters are supported)
      # Note: template have a priority over `files`
      templates:
        - assets/chart_values.tpl.yml

      # [optional] define values inline the flow
      # Note: inlive values have a priority over both `files` and `templates`
      inline:
        ImagePullPolicy: Always

    # [optional] Force resource update through delete/recreate if needed.
    # Default value: false
    force: true

    # [optional] If set, will wait until all Pods, PVCs, Services, and minimum number of Pods
    # of a Deployment are in a ready state before marking the release as successful. It will
    # wait for as long as `timeout`.
    # Default value: false
    wait: true

    # [optional] Еime in seconds to wait for any individual Kubernetes operation (like Jobs for hooks)
    # Default value: 300 (5 minutes)
    # Max allowed value: 3600 (1 hour)
    timeout: 60

    # [optional] Enable verbose output.
    # Default value: false
    debug: false

    # [optional] List of extra arguments to append to the command.
    # Refer to `helm help upgrade` for all available options
    extra:
      - --dry-run
```
