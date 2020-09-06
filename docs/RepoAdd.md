# Add Helm Repository

Action handler that allows to add new repository.

**ID:** `com.fireblink.fbl.plugins.k8s.helm.repo.add`

**Aliases:**

- `fbl.plugins.k8s.helm.repo.add`
- `k8s.helm.repo.add`
- `helm.repo.add`

## Syntax:

```yaml
pipeline:
  helm.repo.add:
    # [optional] Custom helm binary name/path
    # Default value: helm
    binary: 'helm_v3'

    # [required] Name of the repository to add
    name: repo_name

    # [required] URL address of the repository
    url: http://localhost:8888

    # [optional] Enable verbose output.
    # Default value: false
    debug: true

    # [optional] Raise error if repo is already registered
    # Default value: false
    noUpdate: true

    # [optional] Chart repository username
    username: root

    # [optional] Chart repository password
    password: toor

    # [optional] Verify certificates of HTTPS-enabled servers using this CA bundle
    ca: server.ca

    # [optional] Identify HTTPS client using this SSL certificate file
    cert: server.cert
```
