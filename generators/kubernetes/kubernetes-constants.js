const kubernetesDefaultConfig = {
  kubernetesServiceType: 'LoadBalancer',
  monitoring: 'no',
  istio: false,
};

const defaultKubernetesConfig = {
  ...kubernetesDefaultConfig,
};

module.exports = {
  defaultKubernetesConfig,
};
