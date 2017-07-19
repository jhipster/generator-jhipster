# JHipster generated kubernetes configuration

## Preparation

You will need to push your image to a registry. If you have not done so, use the following commands to tag and push the images:

```
<%_ for (let i = 0; i < appsFolders.length; i++) { _%>
    <%_ if (appConfigs[i].baseName.toLowerCase() !== appConfigs[i].targetImageName) { _%>
$ docker image tag <%= appConfigs[i].baseName.toLowerCase() %> <%= appConfigs[i].targetImageName %>
    <%_ } _%>
$ <%= dockerPushCommand %> <%= appConfigs[i].targetImageName %>
<%_ } _%>
```

## Deployment

You can deploy your apps by running:

```
<%_ if (kubernetesNamespace !== 'default') { _%>
$ kubectl apply -f namespace.yml
<%_ } _%>
<%_ if (jhipsterConsole) { _%>
$ kubectl apply -f console
<%_ } _%>
<%_ if (prometheusOperator) { _%>
$ kubectl apply -f prometheus-tpr.yml
<%_ } _%>
<%_ if (gatewayNb >= 1 || microserviceNb >= 1) { _%>
$ kubectl apply -f registry
<%_ } _%>

<%_ for (let i = 0; i < appsFolders.length; i++) { _%>
$ kubectl apply -f <%= appConfigs[i].baseName.toLowerCase() %>
<%_ } _%>
```

## Exploring your services


<%_ if (gatewayNb + monolithicNb >= 1) { _%>
Use these commands to find your application's IP addresses:

```
<%_ for (let i = 0; i < appsFolders.length; i++) { _%>
<%_ if (appConfigs[i].applicationType === 'gateway' || appConfigs[i].applicationType === 'monolith') { _%>
$ kubectl get svc <%= appConfigs[i].baseName.toLowerCase() %><%= kubernetesNamespace === 'default' ? '' : ` -n ${kubernetesNamespace}` %>
        <%_ } _%>
    <%_ } _%>
<%_ } _%>
```

## Scaling your deployments

You can scale your apps using 

```
$ kubectl scale deployment <app-name> --replicas <replica-count><%= kubernetesNamespace === 'default' ? '' : ` -n ${kubernetesNamespace}` %>
```

## zero-downtime deployments

The default way to update a running app in kubernetes, is to deploy a new image tag to your docker registry and then deploy it using

```
$ kubectl set image deployment/<app-name>-app <app-name>=<new-image> <%= kubernetesNamespace === 'default' ? '' : ` -n ${kubernetesNamespace}` %>
```

Using livenessProbes and readinessProbe allows you to tell kubernetes about the state of your apps, in order to ensure availablity of your services. You will need minimum 2 replicas for every app deployment, you want to have zero-downtime deployed. This is because the rolling upgrade strategy first kills a running replica in order to place a new. Running only one replica, will cause a short downtime during upgrades.
<%_ if (jhipsterConsole || prometheusOperator) { _%>

## Monitoring tools

<%_ if (jhipsterConsole) { _%>
### JHipster console

Your application logs can be found in JHipster console (powered by Kibana). You can find its service details by
```
$ kubectl get svc jhipster-console<%= kubernetesNamespace === 'default' ? '' : ` -n ${kubernetesNamespace}` %>
```

Point your browser to an IP of any of your nodes and use the node port described in the output.
<%_ } _%>
<%_ if (prometheusOperator) { _%>

### Prometheus metrics

If not already done, install the [Prometheus operator by CoreOS](https://github.com/coreos/prometheus-operator). You can quickly deploy the operator using 

**hint**: use must build your apps with `prometheus` profile active!

```
$ kubectl create -f https://raw.githubusercontent.com/coreos/prometheus-operator/master/bundle.yaml
```

The prometheus instance for your apps can be explored using

```
$ kubectl get svc prometheus-<%= kubernetesNamespace %><%= kubernetesNamespace === 'default' ? '' : ` -n ${kubernetesNamespace}` %>
```
<%_ } _%>
<%_ } _%>

<%_ if (app.serviceDiscoveryType === 'eureka') { _%>
## JHipster registry

The registry is deployed using a headless service in kubernetes, so the primary service has no IP address, and cannot get a node port. You can create a secondary service for any type, using:

```
$ kubectl expose service jhipster-registry --type=NodePort --name=exposed-registry<%= kubernetesNamespace === 'default' ? '' : ` -n ${kubernetesNamespace}` %>
```

and explore the details using

```
$ kubectl get svc exposed-registry<%= kubernetesNamespace === 'default' ? '' : ` -n ${kubernetesNamespace}` %>
```

For scaling the JHipster registry, use

```
$ kubectl scale statefulset jhipster-registry --replicas 3<%= kubernetesNamespace === 'default' ? '' : ` -n ${kubernetesNamespace}` %>
```
<%_ } _%>


## Troubleshooting

> my apps doesn't get pulled, because of 'imagePullBackof'

check the registry your kubernetes cluster is accessing. If you are using a private registry, you should add it to your namespace by `kubectl create secret docker-registry` (check the [docs](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/) for more info)

> my apps get killed, before they can boot up

This can occur, if your cluster has low resource (e.g. Minikube). Increase the `initialDelySeconds` value of livenessProbe of your deployments

> my apps are starting very slow, despite I have a cluster with many resources

The default setting are optimized for middle scale clusters. You are free to increase the JAVA_OPTS environment variable, and resource requests and limits to improve the performance. Be careful!

<%_ if (prometheusOperator) { _%>
> I have selected prometheus but no targets are visible

This depends on the setup of prometheus operator and the access control policies in your cluster. Version 1.6.0+ is needed for the RBAC setup to work.

> I have selected prometheus, but my targets never get scraped

This means your apps are probably not built using the `prometheus` profile in Maven/Gradle
<%_ } _%>

> my SQL based microservice stuck during liquibase initialization when running multiple replicas

Somethimes the database changelog lock gets corrupted. You will need to connect to the database using `kubectl exec -it` and remove all lines of liquibases `databasechangeloglock` table.
