import { BaseApplication } from '../base-application/types.mjs';

export type JavaApplication = BaseApplication & {
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
