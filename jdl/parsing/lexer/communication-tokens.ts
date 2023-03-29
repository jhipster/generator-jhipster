/**
 * Added communication tokens   
 * @cmi-tic-craxkumar
 */
import { Lexer } from 'chevrotain';
import createTokenFromConfig from './token-creator.js';
import { UNARY_OPTION, KEYWORD } from './shared-tokens.js';
import { communicationOptions } from '../../jhipster/index.mjs';

const { OptionNames } = communicationOptions;

const {
    CLIENT,
    SERVER,
} = OptionNames;

const communicationCategoryToken = createTokenFromConfig({ name: 'COMM_KEY', pattern: Lexer.NA });

const communicationTokens = [
    { name: 'CLIENT', pattern: CLIENT },
    { name: 'SERVER', pattern: SERVER },
].map(tokenConfig => {
    (tokenConfig as any).categories = [communicationCategoryToken];
    if (['SKIP_CLIENT', 'SKIP_SERVER'].includes(tokenConfig.name)) {
    (tokenConfig as any).categories.push(KEYWORD);
    (tokenConfig as any).categories.push(UNARY_OPTION);
  }
    return createTokenFromConfig(tokenConfig);
});

export default {
    categoryToken: communicationCategoryToken,
    tokens: [communicationCategoryToken, ...communicationTokens],
};