import { fileURLToPath } from 'url';
import { minimatch } from 'minimatch';
import { simpleGit } from 'simple-git';

export const getGitChanges = async () => {
  const git = simpleGit({ baseDir: fileURLToPath(new URL('../../', import.meta.url).href) });
  const summary = await git.diffSummary({ '@~1': null });
  const files = summary.files.map(({ file }) => file);
  const hasPatternChanges = (pattern: string) => files.some(file => minimatch(file, pattern, { dot: true }));
  return {
    files,
    base:
      hasPatternChanges('lib/**') ||
      hasPatternChanges('generators/*') ||
      hasPatternChanges('generators/{base*,bootstrap*,git,jdl,project-name}/**'),
    devBlueprint: hasPatternChanges('.blueprint/**'),
    ci:
      hasPatternChanges('.github/{actions,workflows}/**') ||
      hasPatternChanges('generators/{docker-compose,kubernetes*,workspaces}/**'),
    devserverCi: hasPatternChanges('.github/workflows/devserver.yml'),
    common: hasPatternChanges ('generators/{app,common,cypress,docker,languages}/**'),
    client: hasPatternChanges('generators/{client,init,javascript}/**'),
    angular: hasPatternChanges('generators/angular/**'),
    react: hasPatternChanges('generators/react/**'),
    vue: hasPatternChanges('generators/vue/**'),
    java: hasPatternChanges('generators/{cucumber,feign-client,gatling,gradle,java,liquibase,maven,server,spring*}/**'),
  };
};
