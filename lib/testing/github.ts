import { randomUUID } from 'node:crypto';
import { appendFileSync, existsSync } from 'node:fs';
import { EOL } from 'node:os';
import axios from 'axios';

export const parseIssue = (issue: string): undefined | { owner: string; repository: string; issue: string } => {
  if (issue.includes('#')) {
    const split = issue.split('/');
    const split2 = split[1].split('#');
    return { owner: split[0], repository: split2[0], issue: split2[1] };
  }
  return undefined;
};

export const getGithubOutputFile = (): string | undefined => {
  const filePath = process.env.GITHUB_OUTPUT;
  return filePath && existsSync(filePath) ? filePath : undefined;
};

export const setGithubTaskOutput = (name: string, value: string | boolean | number) => {
  const delimiter = `delimiter_${randomUUID()}`;
  const output = `${name}<<${delimiter}${EOL}${value}${EOL}${delimiter}${EOL}`;
  const filePath = getGithubOutputFile();
  if (filePath) {
    appendFileSync(filePath, output, { encoding: 'utf8' });
  } else {
    // eslint-disable-next-line no-console
    console.log(output);
  }
};

export const getGithubIssue = async ({ owner, repository, issue }: { owner: string; repository: string; issue: string }) => {
  const response = await axios.get(`https://api.github.com/repos/${owner}/${repository}/issues/${issue}`, {
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  return response.data;
};
