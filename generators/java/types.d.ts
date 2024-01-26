import { BaseApplication } from '../base-application/types.js';

export type JavaApplication = BaseApplication & {
  javaVersion: string;

  packageName: string;
  packageFolder: string;

  srcMainJava: string;
  srcMainResources: string;
  srcMainWebapp: string;
  srcTestJava: string;
  srcTestResources: string;
  srcTestJavascript: string;

  javaPackageSrcDir: string;
  javaPackageTestDir: string;

  temporaryDir: string;

  javaDependencies: Record<string, string>;
  packageInfoJavadocs: { packageName: string; documentation: string }[];

  prettierJava: boolean;

  imperativeOrReactive: string;
};
