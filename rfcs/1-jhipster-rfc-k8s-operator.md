// This is a RFC template based on the Rust RFC process but simplified: https://github.com/rust-lang/rfcs/

- Feature Name: JHipster Kubernetes Operator
- Start Date: 8/8/19
- Issue: [jhipster/generator-jhipster#10053](https://github.com/jhipster/generator-jhipster/10053)

# Summary
[summary]: #summary

The JHipster Operators uses Kubernetes CRDs (Custom Resource Definitions) to encapsulate operational knowledge about JHipster Applications. 


# Motivation
[motivation]: #motivation

Integrating with Kubernetes requires more than just the Kubernetes Manifest to get our containers running inside the platform. The JHipster Kubernetes Operator will enable JHipster MicroService Applications (projects) to be managed and understood by the platform in a native way.

**Note:** It is important to understand that the current JHipster architecture is not going to be changed. A Kubernetes Operator is something that will run along our JHipster Applications. 

The JHipster Kubernetes Operator adds on top of existing JHipster Applications running in K8s all the operational knowledge required to manage and maintain these applications over time. 

The whole idea of having an operator makes sense only after having an application running in Kubernetes for some time. In other words, if you are looking for just deploying your application you should use the `jhipster kubernetes` or `jhipster kubernetes-helm` generators. 

Once your application is running there will be questions that start to pop up such as:

- What happens if I want to deploy a second (or more) JHipster MicroServices Application? Is it going to work? 
  - If I have two (or more) applications , can I share the JHipster Registry between the two? 
- How can I make sure that all the MicroServices that are composing my application are up? How can I be notified if something goes down? 
- How can I upgrade/version an entire application (Set of microservices)?

With the JHipster Operator we try to provide a place (component) where we can iteratively answer all these questions. 

![JHipster K8s Operator](https://github.com/salaboy/jhipster-operator/blob/master/imgs/jhipster-operator-simplified.png "JHipster K8s Operator")

Notice that all the JHipster applications are running as we know them today inside a K8s cluster, and the JHipster K8s Operator sits on top and with these existing applications. 

Main objectives: 
- Understand JHipster Applications (root resource)
  - And Modules (Gateway, MicroServices, Registry..) (secondary/managed resources)
  - It makes K8s aware of these concepts
- Manage one or more JHipster Applications  
- Understand a JHipster Application topology
  - Understand how things are wired together
  - Understand and validate the Applications State as a whole
- Provide advanced lifecycle management
  - Shared infrastructure wiring
  - Garbage collection / Orphan Services
  - Versioning
  - Advanced Dynamic Traffic Routing
  - The use of Functions as part of applications
  - Manage centralized configuration
- Provide an integration point for other CRD Based Kubernetes Extensions
  - Can provide (or configure) hierarchical routing (Integration with Istio/Ingress)
  - Can understand about KNative Functions and integrate with them
- Provide an extension point for domain specific extensions (JHipster Implementations)

Things that the Operator will **NOT** do: 
- The Operator will not provide a deployment mechanism: deployment of application should be done by pipelines using tools like HELM, see the `jhipster kubernetes-helm` generator
- The Operator will not provide routing: the operator can configure routes in other components such as in Istio Gateway, or create Ingress to an Ingress Controller
- The Operator will not deal with JDL files, it will only consume resources deployed to the Kubernetes Cluster
- The Operator will not change the current JHipster architecture, it will just enhance it in a non intrusive way. 

# Guide-level explanation
[guide-level-explanation]: #guide-level-explanation

You can use the JHipster Kubernetes Operator to monitor and manage your JHipster MicroServices Applications running inside Kubernetes.In order to deploy your applications to Kubernetes you can use the `jhipster kubernetes` and `jhipster kubernetes-helm` generators to generate the Kubernetes Manifest required to run your containers in K8s. 

![JHipster Flow to K8s](https://github.com/salaboy/jhipster-operator/blob/master/imgs/jhipster-flow.png "JHipster Flow to K8s")

After deploying your applications to a Kubernetes environment you can deploy the JHipster Kubernetes Operator to your cluster by (GUIDE on how to deploy here)

Once the Operator is running you will be able to:
1) Interact with the Kubernetes API to get JHipster specific resources, such as Applications, MicroServices, Gateways and Registries and see the relationships between them. You will be able to describe each of the resources to obtain more details about the services that are related to the application
2) Automatically expose applications based on the healthyness of all the services belonging to that application, if a service is failing the application might be automatically hidden from the end users. This can be achieved by creating new Ingress or new Gateway Routes for Istio
3) Manage multiple applications deployed in the same cluster
4) Control the applications topology and isolation with other Applications
5) Share infrastructure (Registry, SSO, maybe datastores) between different applications 
6) (future) manage versioning
7) (future) define SLAs for services, and which services are required for an application (set of microservices) to be healthy
8) (future) if Istio is enabled, automatically create traffic routes and rules


# Reference-level explanation
[reference-level-explanation]: #reference-level-explanation

The Operator defines 4 Custom Resource Definitions:
- applications.alpha.k8s.jhipster.tech
- gateways.alpha.k8s.jhipster.tech
- microservices.alpha.k8s.jhipster.tech
- registries.alpha.k8s.jhipster.tech

[These CRDs definitions can be found here](https://github.com/salaboy/jhipster-operator/tree/master/kubernetes/deploy/crds).

The JHipster Kubernetes Operator will use these resource definitions to understand, monitor and manage deployed applications. When an application is deployed to Kubernetes, we will need to decorate our existing K8s Services descriptors with these Custom Resources for the Operator to understand the application structure. These Custom Resources instances such as JHipster Application, MicroService, Gateway can be generated based on the JDL syntax by the `jhipster kubernetes` and `jhipster kubernetes-helm` generators. 

Once these resources are deployed as part of the normal Kubernetes deployment procedure, the Operator will be able to monitor the state of the entire application. 

The Operator will expose a set of APIs to fine tune the default behaviour and also to expose relevant information such as:
- List of available applications (same information that is provided by the Kubernetes API)
- Details of an application, related services, healthy status, version, etc
- Delete an application (a whole set of services)
- Expose / Hide an application (by integrating with a component that can route traffic)

Because we are using CRDs we will be able to ask to the Kubernetes APIs about our JHipster Resources using for example the `kubectl` command. 

An important aspect of the Operator is that it will not be in charge of deploying applications. Deployment should be done by standard tools such as HELM or the default Kubernetes APIs that we use after generatign the Kubernetes Manifests. The Operator responsability is to monitor and manage applications, not to deploy them. 

The JHipster Kubernetes Operator can be built as a Spring Boot Starter meaning that it doesn't nesseraly needs to be it is own independent container it can be attached to an existing service if it is required.

The Operator will provide an excelent entry point for domain specific extensions and integrations with other platform wide services such as Istio, KNative, Jenkins X (Tekton Pipelines), etc. It will provide the entry point for a Developer Workflow on top of Kubernetes. 


# Drawbacks
[drawbacks]: #drawbacks

Because the Operator will run inside a Kubernetes Pod, we need to grant the Operator's deployment with a special Service Account, Role and Role Bindings for it to be able to 
interact with the Kubernetes APIs. [You can find these extra manifests here](https://github.com/salaboy/jhipster-operator/tree/master/kubernetes/deploy).

A Kubernetes Operator only make sense if you are planning to run your application in Kubernetes, for people that is not there yet, this might cause confusion. The Operator Documentation and guides should clearly explain what and why the Operator is trying to solve these platform wide concerns and its advantages. 


# Rationale and alternatives
[rationale-and-alternatives]: #rationale-and-alternatives

Building Kubernetes Operators is a long journey. In order to find some best practices we need to iterate and improve while we learn. We don't have all the answers right now, but having a concreate project will help us to improve it until it is useful for the entire community. 

# Prior art
[prior-art]: #prior-art

You can see here my first attempt here: https://github.com/salaboy/jhipster-operator/tree/jhipsterconf19
The README.md file provides a glimpse of this first iteration, but after a lot of feedback a set of changes will be applied in the master branch to make the Operator simpler and more focused. 

- Presentation in JHipster Conf 2: https://salaboy.com/2019/07/03/jhipster-conf-rocks/
- Source code(first stab at it): https://github.com/salaboy/jhipster-operator
- Slides: https://www.slideshare.net/salaboy/do-we-need-a-jhipster-kubernetes-operator
- Video: https://youtu.be/9iqTtwptTT8

# Frequently Asked Questions (F.A.Q.)

- **Q: This definitely is cool but is this really necessary for a JHipster application.**
- **A**: If you are running in Kubernetes, the JHipster K8s Operator will provide you extra functionality and it will allow Kubernetes to understand JHipster specific concerns. 
- **Q: Are we rebuilding any features provided by tools like Istio(coz many of the proposed features looks very similar to what it does)**
- **A**: Not at all, we are providing an integration point for tools like Istio, KNative and CI/CD tools based on CRDs such as Jenkins X and Spinnaker.
- **Q: While a JHipster CRD is cool it also means more tie in into JHipster in terms of deployment architecture is that necessary?**
- **A**: CRDs are just yaml files as the one that we need to deploy into Kubernetes, and are generated by the `jhipster kubernetes` and `jhipster kubernetes-helm` generators, so we are not changing anything regarding our deployment architecture. We are just decorating our existing manifest with JHipster Specific Resources, and this decoration can be optional. The CRDs are encapsulated, managed and installed by the Operator itself. 

# Unresolved questions
[unresolved-questions]: #unresolved-questions

- How to deal with versioning?
- Do we need to extend the information included in the JDL language? 
- Do we want to run each application in a different namespace? If so, the Operator can deal and abstract these mappings.

# Future possibilities
[future-possibilities]: #future-possibilities

- Define Operator Cloud Events
- Add Swagger docs
- Istio integration
- KNative integration
- Jenkins X / Tekton Pipelines integration
![Future JHipster Operator](https://github.com/salaboy/jhipster-operator/blob/master/imgs/jhipster-operator-future.png "Future JHipster Operator")
