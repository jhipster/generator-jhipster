export type GradleScript = { script: string };

export type GradleDependency = { groupId: string; artifactId: string; version?: string; scope: string };

export type GradlePlugin = { id: string; version?: string };

export type GradleProperty = { property: string; value: string };

export type GradleRepository = { url: string; username?: string; password?: string };

export type GradleTomlVersion = { name: string; version?: string };

export type GradleTomlAnyItemVersion = { version: string } | { ['version.ref']: string };

export type GradleTomlLibraryId = { module: string } | { group: string; name: string };

export type GradleLibrary = { libraryName: string; scope?: string } & (
  | { library: string }
  | (GradleTomlLibraryId & GradleTomlAnyItemVersion)
);

export type GradleTomlPlugin = { pluginName: string; addToBuild?: boolean } & (
  | { plugin: string }
  | ({ id: string } & GradleTomlAnyItemVersion)
);

export type GradleSourceType = {
  applyFromGradle?(script: GradleScript): void;
  addGradleDependency?(dependency: GradleDependency): void;
  addGradlePlugin?(plugin: GradlePlugin): void;
  addGradlePluginManagement?(pluginManagement: GradlePlugin): void;
  addGradleProperty?(property: GradleProperty): void;
  addGradleMavenRepository?(repository: GradleRepository): void;
  addGradleBuildSrcDependency?(dependency: GradleDependency): void;
  addGradleDependencyCatalogVersion?(catalogVersion: GradleTomlVersion): void;
  addGradleDependencyCatalogLibrary?(catalogVersion: GradleLibrary): void;
  addGradleDependencyCatalogLibraries?(catalogVersion: GradleLibrary[]): void;
  addGradleDependencyCatalogPlugin?(catalogVersion: GradleTomlPlugin): void;
  addGradleDependencyCatalogPlugins?(catalogVersion: GradleTomlPlugin[]): void;
  addGradleBuildSrcDependencyCatalogVersion?(catalogVersion: GradleTomlVersion): void;
};
