import type { RequireOneOrNone } from 'type-fest';

export type GradleComment = { comment?: string };

export type GradleScript = { script: string };

export type GradleLibraryDependency = { libraryName: string; scope?: string };

export type GradleDependency = (
  | { groupId: string; artifactId: string; version?: string; scope: string; classifier?: string }
  | Required<GradleLibraryDependency>
) & { closure?: string[] };

export type GradlePlugin = { id: string; version?: string };

export type GradleProperty = { property: string; value?: string };

export type GradleRepository = { url: string; username?: string; password?: string };

export type GradleTomlVersion = { name: string; version?: string };

export type GradleTomlAnyItemVersion = RequireOneOrNone<{ version: string; 'version.ref': string }, 'version' | 'version.ref'>;

export type GradleTomlLibraryId = { module: string } | { group: string; name: string };

export type GradleLibrary = GradleLibraryDependency & ({ library: string } | (GradleTomlLibraryId & GradleTomlAnyItemVersion));

export type GradleTomlPlugin = { pluginName: string; addToBuild?: boolean } & (
  | { plugin: string }
  | ({ id: string } & GradleTomlAnyItemVersion)
);

export type GradleFileNeedleOptions = { gradleFile?: string };
export type GradleCatalogNeedleOptions = { gradleVersionCatalogFile?: string };

export type GradleNeedleOptions = GradleFileNeedleOptions & GradleCatalogNeedleOptions;

export type GradleSourceType = {
  _gradleDependencies?: GradleDependency[];
  applyFromGradle?(script: GradleScript): void;
  addGradleDependency?(dependency: GradleDependency, options?: GradleFileNeedleOptions): void;
  addGradleDependencies?(dependency: GradleDependency[], options?: GradleFileNeedleOptions): void;
  addGradlePlugin?(plugin: GradlePlugin): void;
  addGradlePluginManagement?(pluginManagement: GradlePlugin): void;
  addGradleProperty?(property: GradleProperty & GradleComment): void;
  addGradleMavenRepository?(repository: GradleRepository): void;
  addGradleBuildSrcDependency?(dependency: GradleDependency): void;

  addGradleDependencyCatalogVersion?(catalogVersion: GradleTomlVersion, options?: GradleCatalogNeedleOptions): void;
  addGradleDependencyCatalogVersions?(catalogVersion: GradleTomlVersion[], options?: GradleCatalogNeedleOptions): void;
  addGradleDependencyCatalogLibrary?(catalogVersion: GradleLibrary, options?: GradleNeedleOptions): void;
  addGradleDependencyCatalogLibraries?(catalogVersion: GradleLibrary[], options?: GradleNeedleOptions): void;
  addGradleDependencyCatalogPlugin?(catalogVersion: GradleTomlPlugin): void;
  addGradleDependencyCatalogPlugins?(catalogVersion: GradleTomlPlugin[]): void;

  addGradleBuildSrcDependencyCatalogVersion?(catalogVersion: GradleTomlVersion): void;
  addGradleBuildSrcDependencyCatalogVersions?(catalogVersion: GradleTomlVersion[]): void;
  addGradleBuildSrcDependencyCatalogLibraries?(catalogVersion: GradleLibrary[]): void;
};

export type GradleApplication = {
  gradleVersion?: string;
  gradleBuildSrc?: string;
};
