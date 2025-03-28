import { randomUUID } from 'node:crypto';
import { appendFileSync, existsSync } from 'node:fs';
import { EOL } from 'node:os';
import process from 'node:process';

type GithubIssue = { owner: string; repository: string; issue: string };

export const parseIssue = (issue: string): GithubIssue => {
  const result = /^(((?<owner>[^/]*)\/)?(?<repository>[^#]+)#)?(?<issue>\d+)$/.exec(issue);
  const groups = result?.groups;
  if (groups) {
    return { ...groups } as GithubIssue;
  }
  throw new Error(`Invalid issue format: ${issue}`);
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

export const getGithubIssue = async ({ owner, repository, issue }: { owner: string; repository: string; issue: string }): Promise<any> => {
  const token = process.env.GITHUB_TOKEN;
  const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/issues/${issue}`, {
    method: 'GET',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: token ? `Bearer ${token}` : undefined,
    } as Record<string, string>,
  });
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  return await response.json();
};

export const getGithubSummaryFile = (): string | undefined => {
  const filePath = process.env.GITHUB_STEP_SUMMARY;
  return filePath && existsSync(filePath) ? filePath : undefined;
};

export const appendToSummary = (summary: string) => {
  const summaryFile = getGithubSummaryFile();
  if (summaryFile) {
    appendFileSync(summaryFile, summary, { encoding: 'utf8' });
  }
};
