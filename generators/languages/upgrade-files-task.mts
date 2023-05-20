import shelljs from 'shelljs';

import BaseGenerator from '../base/index.mjs';
import { SERVER_MAIN_RES_DIR } from '../generator-constants.mjs';
import { languageSnakeCase, languageToJavaLanguage } from './support/index.mjs';

/**
 * Execute a git mv.
 * A git mv operation is required due to file casing change eg: en_us -> en_US at a case insensitive OS.
 *
 * @param source
 * @param dest
 * @returns {boolean} true if success; false otherwise
 */
function gitMove(this: BaseGenerator, from: string, to: string) {
  const source = this.destinationPath(from);
  const dest = this.destinationPath(to);
  if (source && dest && shelljs.test('-f', source)) {
    this.log.verboseInfo(`Renaming the file - ${source} to ${dest}`);
    return !shelljs.exec(`git mv -f ${source} ${dest}`).code;
  }
  return true;
}

/**
 * Upgrade files.
 */
export default function upgradeFilesTask(this: BaseGenerator) {
  let atLeastOneSuccess = false;
  if (this.isJhipsterVersionLessThan('6.1.0')) {
    const languages = this.config.get<string[]>('languages');
    if (languages) {
      const langNameDiffer = function (lang) {
        const langProp = languageSnakeCase(lang);
        const langJavaProp = languageToJavaLanguage(lang);
        return langProp !== langJavaProp ? [langProp, langJavaProp] : undefined;
      };
      languages
        .map(langNameDiffer)
        .filter(props => props)
        .forEach(props => {
          const code = gitMove.call(
            this,
            `${SERVER_MAIN_RES_DIR}i18n/messages_${props![0]}.properties`,
            `${SERVER_MAIN_RES_DIR}i18n/messages_${props![1]}.properties`
          );
          atLeastOneSuccess = atLeastOneSuccess || code;
        });
    }
  }
  return atLeastOneSuccess;
}
