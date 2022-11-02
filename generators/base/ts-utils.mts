import { platform } from 'os';

import generatorUtils from '../utils.cjs';
import type { EditFileCallback } from './api.mjs';

const { normalizeLineEndings } = generatorUtils;

const isWin32 = platform() === 'win32';

/**
 * TODO move to utils when converted to typescripts
 * Converts multiples EditFileCallback callbacks into one.
 */
// eslint-disable-next-line import/prefer-default-export
export function joinCallbacks<Generator>(...callbacks: EditFileCallback<Generator>[]): EditFileCallback<Generator> {
  return function (this: Generator, content: string, filePath: string) {
    if (isWin32 && content.match(/\r\n/)) {
      const removeSlashRSlashN: EditFileCallback<Generator> = ct => normalizeLineEndings(ct, '\n');
      const addSlashRSlashN: EditFileCallback<Generator> = ct => normalizeLineEndings(ct, '\r\n');
      callbacks = [removeSlashRSlashN, ...callbacks, addSlashRSlashN];
    }
    for (const callback of callbacks) {
      content = callback.call(this, content, filePath);
    }
    return content;
  };
}
