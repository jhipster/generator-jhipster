import { JHipsterOptionDefinition } from '../../../../../jdl/types/types.js';

export const jdlRoutesOptions: JHipsterOptionDefinition = {
  name: 'routes',
  tokenType: 'quotedList',
  type: 'quotedList',
  tokenValuePattern: /^"[A-Za-z][A-Za-z0-9_]*(?::[A-Za-z][A-Za-z0-9_]+(?::[0-9]+)?)?"$/,
};
