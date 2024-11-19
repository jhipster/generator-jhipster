const ciMarkdownCodeSeparator = '\\`\\`\\`';

export const markdownDetails = ({
  title,
  content,
  codeType,
  contentWrapper = codeType ? null : 'pre',
}: {
  title: string;
  content: string;
  contentWrapper?: string | null;
  codeType?: string;
}): string => {
  let details: string;
  if (contentWrapper) {
    details = `  <${contentWrapper}>${content}</${contentWrapper}>`;
  } else if (codeType) {
    details = `\n${ciMarkdownCodeSeparator}${codeType}\n${content}\n${ciMarkdownCodeSeparator}`;
  } else {
    details = content;
  }
  return `<details>\n  <summary>${title}</summary>\n${details}\n</details>`;
};
