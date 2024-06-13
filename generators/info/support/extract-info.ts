import { GENERATOR_JHIPSTER } from '../../generator-constants.js';

export type InfoFile = { filename: string; content: string };

export type InfoData = {
  yoRcContent: string | undefined;
  jdlDefinitions: string | undefined;
  jdlEntitiesDefinitions: string | undefined;
  yoRcBlank: boolean;
  yoRcValid: boolean;
  files: InfoFile[];
  workspacesFolders: string[] | undefined;
};

export const extractDataFromInfo = (info: string): InfoData => {
  const regexp = /<summary>(?<title>(?:(?!<\/summary>).)+)<\/summary>\s+<pre>(?<body>(?:(?!<\/pre>).)+)/gs;
  let yoRcContent: string | undefined;
  let jdlEntitiesDefinitions: string | undefined;
  let jdlDefinitions: string | undefined;
  let workspacesFolders;
  const files: { filename: string; content: string }[] = [];

  for (const match of info.matchAll(regexp)) {
    const { title, body } = match.groups ?? {};
    if (title?.trim() && body?.trim()) {
      if (title.includes('.yo-rc.json file')) {
        if (title.includes(' for ')) {
          const folder = title.split(' for ')[1].trim();
          files.push({ filename: `${folder}/.yo-rc.json`, content: body.trim() });
        } else {
          yoRcContent = body.trim();
        }
      } else if (title.includes('JDL entity definitions')) {
        jdlEntitiesDefinitions = body.trim();
      } else if (title.includes('JDL definitions')) {
        // JDL definitions can be be a placehoder
        if (body.includes('application')) {
          jdlDefinitions = body.trim();
        }
      }
    }
  }

  let yoRcBlank = true;
  let yoRcValid = false;
  if (yoRcContent) {
    yoRcBlank = false;
    try {
      let content = JSON.parse(yoRcContent);
      content = GENERATOR_JHIPSTER in content ? content : { [GENERATOR_JHIPSTER]: content };
      workspacesFolders = content[GENERATOR_JHIPSTER].appsFolders;
      yoRcContent = JSON.stringify(content);
      yoRcValid = true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Invalid .yo-rc.json file', error);
    }
  }

  if (jdlDefinitions) {
    files.push({ filename: 'app.jdl', content: jdlDefinitions });
    yoRcContent = undefined;
    jdlEntitiesDefinitions = undefined;
  }
  if (jdlEntitiesDefinitions) {
    files.push({ filename: 'entities.jdl', content: jdlEntitiesDefinitions });
  }
  if (yoRcContent) {
    files.push({ filename: '.yo-rc.json', content: yoRcContent });
  }
  return { yoRcContent, jdlEntitiesDefinitions, jdlDefinitions, yoRcBlank, yoRcValid, files, workspacesFolders };
};
