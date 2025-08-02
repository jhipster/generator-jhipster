import { removeFieldsWithNullishValues } from '../../../lib/utils/index.ts';
import { GENERATOR_JHIPSTER } from '../../generator-constants.js';

export type InfoFile = { filename: string; content: string; type: 'jdl' | 'yo-rc' | 'entity-jdl' | 'json' };

export type InfoData = {
  yoRcContent: string | undefined;
  jdlDefinitions: string | undefined;
  jdlApplications: number | undefined;
  jdlEntitiesDefinitions: string | undefined;
  yoRcBlank: boolean;
  yoRcValid?: boolean;
  files: InfoFile[];
  workspacesFolders: string[] | undefined;
};

export const extractDataFromInfo = (info: string): InfoData => {
  const regexp = /<summary>(?<title>(?:(?!<\/summary>).)+)<\/summary>\s+<pre>(?<body>(?:(?!<\/pre>).)+)/gs;
  let yoRcContent: string | undefined;
  let jdlEntitiesDefinitions: string | undefined;
  let jdlDefinitions: string | undefined;
  let jdlApplications: number | undefined;
  let workspacesFolders;
  const files: InfoFile[] = [];

  for (const match of info.matchAll(regexp)) {
    const { title, body } = match.groups ?? {};
    if (title?.trim() && body?.trim()) {
      if (title.includes('.yo-rc.json file')) {
        if (title.includes(' for ')) {
          const folder = title.split(' for ')[1].trim();
          files.push({ filename: `${folder}/.yo-rc.json`, content: body.trim(), type: 'yo-rc' });
        } else {
          yoRcContent = body.trim();
          files.push({ filename: '.yo-rc.json', content: yoRcContent, type: 'yo-rc' });
        }
      } else if (title.includes(' file')) {
        files.push({ filename: title.split(' file')[0].trim(), content: body.trim(), type: 'json' });
      } else if (title.includes('JDL entity definitions')) {
        jdlEntitiesDefinitions = body.trim();
        files.push({ filename: 'entities.jdl', content: jdlEntitiesDefinitions, type: 'entity-jdl' });
      } else if (title.includes('JDL definitions')) {
        // JDL definitions can be be a placehoder
        if ((body.match(/application\s*\{/g) || []).length > 0) {
          const jdlCount = files.filter(file => file.type === 'jdl').length;
          files.push({ filename: jdlCount === 0 ? 'app.jdl' : `app-${jdlCount}.jdl`, content: body.trim(), type: 'jdl' });
          jdlApplications ??= (body.match(/application\s*\{/g) || []).length;
          jdlDefinitions ??= body.trim();
        }
      }
    }
  }

  let yoRcBlank = true;
  let yoRcValid: boolean | undefined;
  if (yoRcContent) {
    yoRcBlank = false;
    try {
      let content = JSON.parse(yoRcContent);
      content = GENERATOR_JHIPSTER in content ? content : { [GENERATOR_JHIPSTER]: content };
      workspacesFolders = content[GENERATOR_JHIPSTER].appsFolders;
      yoRcContent = JSON.stringify(content);
      yoRcValid = true;
    } catch (error) {
      yoRcValid = false;
      // eslint-disable-next-line no-console
      console.log('Invalid .yo-rc.json file', error);
    }
  }

  if (jdlDefinitions) {
    yoRcContent = undefined;
    jdlEntitiesDefinitions = undefined;
  }

  return removeFieldsWithNullishValues({
    yoRcContent,
    jdlEntitiesDefinitions,
    jdlDefinitions,
    yoRcBlank,
    yoRcValid,
    files,
    workspacesFolders,
    jdlApplications,
  });
};
