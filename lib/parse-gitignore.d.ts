declare module 'parse-gitignore' {
  export default function parseGitignore(content: string): { patterns: string[] };
}
