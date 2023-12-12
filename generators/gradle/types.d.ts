export type GradleScript = { script: string };

export type GradleDependency = { groupId: string; artifactId: string; version?: string; scope: string };

export type GradlePlugin = { id: string; version?: string };

export type GradleProperty = { property: string; value: string };

export type GradleRepository = { url: string; username?: string; password?: string };

export type GradleSourceType = {
  applyFromGradle?(script: GradleScript): void;
  addGradleDependency?(dependency: GradleDependency): void;
  addGradlePlugin?(plugin: GradlePlugin): void;
  addGradlePluginManagement?(pluginManagement: GradlePlugin): void;
  addGradleProperty?(property: GradleProperty): void;
  addGradleMavenRepository?(repository: GradleRepository): void;
};
