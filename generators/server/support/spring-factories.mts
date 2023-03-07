import _ from 'lodash';

const { escapeRegExp } = _;

// eslint-disable-next-line import/prefer-default-export
export const addSpringFactory =
  ({ key, value }) =>
  content => {
    const match = content?.match(`${escapeRegExp(key)}(\\w*)=`);
    if (match) {
      const matchEnd = match.index + match[0].length;
      content = `${content.slice(0, matchEnd)}\\
${value},${content.slice(matchEnd)}`;
    } else {
      content = `${content ? `${content.trimEnd()}\n\n` : ''}${key}=\\
${value}
`;
    }
    return content;
  };
