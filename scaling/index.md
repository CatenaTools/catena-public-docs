# Scaling Catena

Since developers are not required to use any more than the services and features they actually need, scaling Catena is not a one-size-fits-all endeavour. 

Most Catena services lend themselves well to scaling out across multiple nodes. This is possible when the data store or state for these services is shared via an external database and most Catena services are designed to work this way. These services can be cloned across many, many Catena nodes and clients/servers/etc can connect to any of the Catena nodes with consistent effect.

Typically, the bottleneck in scaling Catena is in the persistent data store (database) backing these services. The scaling of these databases will greatly depend on the database engine and where/how it is operated.

## Limitations

Certain services and components do not currently support service scale out, at least not without limitations. For example, the matchmaking service utilizing AWS FlexMatch as a matchmaker can scale out without limitations. However, when running the same matchmaking service utilizing the Catena matchmaker instead, only one instance of the service should be running.

{% admonition type="info" %}
Coming soon: Individual component scaling information
{% /admonition %}

## Multiple nodes

Currently, Catena supports independent, multi-node "clusters". In these arrangements, multiple nodes are deployed with either the same configuration (cloning all services) or with each node having its own configuration or role in the system and running a subset of services.

### Helm
[Helm](https://helm.sh/) is a great tool for template-based multi-node Catena deployments. There are a set of example Helm charts in the [catena-tools-core git repo](https://github.com/CatenaTools/catena-tools-core/tree/main/helm/catena/charts/catena-tools).

## Load testing

The Catena development team utilizes [k6](https://grafana.com/docs/k6/latest/) to load test Catena. The load test suite can be found in the [catena-load-test git repo](https://github.com/CatenaTools/catena-load-test).

The current tests focus on common operations and identifying bottlenecks or failure points.

## Fault tolerance / health checking

Catena includes a common health check endpoint that services can implement. A minimum response is a true/false indication of whether the service is healthy. However, the response can also include more granular health results from components that the service leverages: databases, connectivity to external APIs, etc.

A health check of the Catena node leverages the health check responses from individual services, including whether their health check is accessible. This node-level health check is often used in health dashboards and with container orchestrators that can dynamically provision/remove/replace unhealthy nodes or services.