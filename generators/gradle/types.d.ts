import { RequireOneOrNone } from 'type-fest';

export type GradleScript = { script: string };

export type GradleDependency = { groupId: string; artifactId: string; version?: string; scope: string; classifier?: string };

export type GradlePlugin = { id: string; version?: string };

export type GradleProperty = { property: string; value: string };

export type GradleRepository = { url: string; username?: string; password?: string };

export type GradleTomlVersion = { name: string; version?: string };

export type GradleTomlAnyItemVersion = RequireOneOrNone<{ version: string; 'version.ref': string }, 'version' | 'version.ref'>;

export type GradleTomlLibraryId = { module: string } | { group: string; name: string };

export type GradleLibrary = { libraryName: string; scope?: string } & (
  | { library: string }
  | (GradleTomlLibraryId & GradleTomlAnyItemVersion)
);

export type GradleTomlPlugin = { pluginName: string; addToBuild?: boolean } & (
  | { plugin: string }
  | ({ id: string } & GradleTomlAnyItemVersion)
);

export type GradleNeedleOptions = { gradleFile?: string };

export type GradleSourceType = {
  applyFromGradle?(script: GradleScript): void;
  addGradleDependency?(dependency: GradleDependency, options?: GradleNeedleOptions): void;
  addGradleDependencies?(dependency: GradleDependency[], options?: GradleNeedleOptions): void;
  addGradlePlugin?(plugin: GradlePlugin): void;
  addGradlePluginManagement?(pluginManagement: GradlePlugin): void;
  addGradleProperty?(property: GradleProperty): void;
  addGradleMavenRepository?(repository: GradleRepository): void;
  addGradleBuildSrcDependency?(dependency: GradleDependency): void;
  addGradleDependencyCatalogVersion?(catalogVersion: GradleTomlVersion): void;
  addGradleDependencyCatalogVersions?(catalogVersion: GradleTomlVersion[]): void;
  addGradleDependencyCatalogLibrary?(catalogVersion: GradleLibrary, options?: GradleNeedleOptions): void;
  addGradleDependencyCatalogLibraries?(catalogVersion: GradleLibrary[], options?: GradleNeedleOptions): void;
  addGradleDependencyCatalogPlugin?(catalogVersion: GradleTomlPlugin): void;
  addGradleDependencyCatalogPlugins?(catalogVersion: GradleTomlPlugin[]): void;
  addGradleBuildSrcDependencyCatalogVersion?(catalogVersion: GradleTomlVersion): void;
};
