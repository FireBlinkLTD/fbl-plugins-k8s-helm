# Update or Install Helm Chart

Action handler that allows to install new / update existing helm chart release.

**ID:** com.fireblink.fbl.plugins.k8s.helm.upgrade

**Aliases:**
* `fbl.plugins.k8s.helm.upgrade`
* `fbl.plugins.k8s.helm.install`
* `k8s.helm.upgrade`
* `k8s.helm.install`
* `helm.upgrade`
* `helm.install`

## Syntax:

```yaml
pipeline:
  helm.install:
    # [required] release name
    release: 'string'

    # [required} chart name or local path (absolute or relative to the flow file)
    chart: 'repo/chart'

    # [optional] specify the exact chart version to use. If this is not specified, the latest version is used (works only for charts referenced from repositories)
    version: '1.0.0.'

    # [optional] k8s namespace into which to install the release, default value: `default`
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

    # [optional] force resource update through delete/recreate if needed, default value: false
    force: true

    # [optional] if set, will wait until all Pods, PVCs, Services, and minimum number of Pods 
    # of a Deployment are in a ready state before marking the release as successful. It will 
    # wait for as long as `timeout`. Default value: false
    wait: true

    # [optional] time in seconds to wait for any individual Kubernetes operation (like Jobs for hooks)
    # Default value: 300 (5 minutes)
    # Max allowed value: 3600 (1 hour)
    timeout: 60

    # [optional] print debug statement, default value: false
    debug: false

    # [optional] list of extra arguments to append to the command
    # Refer to `helm help upgrade` for all available options
    extra: 
      --dry-run
```