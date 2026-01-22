import { readFileSync, writeFileSync } from 'node:fs';

import { type StructuredPatchHunk, applyPatch, structuredPatch } from 'diff';

const splitHunk = ({ lines, ...hunk }: StructuredPatchHunk, contextSize: number) => {
  let contextLines: string[] = [];
  let hunkLines: string[] = [];
  const hunks: StructuredPatchHunk[] = [];
  for (const line of lines) {
    if (line.startsWith(' ')) {
      contextLines.push(line);
      if (contextLines.length >= contextSize && hunkLines.length > 0) {
        hunks.push({ lines: [...hunkLines, ...contextLines], ...hunk });
        hunkLines = [];
      }
    } else {
      hunkLines.push(...contextLines, line);
      contextLines = [];
    }
  }
  if (hunkLines.length > 0) {
    hunks.push({ lines: [...contextLines, ...hunkLines], ...hunk });
  }
  return hunks;
};

type ApplyOptions = { templateFile: string; oldFileContents: string; newFileContents: string; contextSize?: number; fuzzFactor?: number };

export const applyChangesToFile = ({ templateFile, oldFileContents, newFileContents, contextSize = 2, fuzzFactor = 0 }: ApplyOptions) => {
  const patch = structuredPatch(templateFile, templateFile, oldFileContents, newFileContents, undefined, undefined, {
    context: contextSize,
    // newlineIsToken: false,
    // ignoreWhitespace: true,
    // oneChangePerToken: true,
    // maxEditLength: 3,
  });
  patch.hunks = patch.hunks
    .map(({ lines, ...remaining }) => ({
      ...remaining,
      lines: lines
        .map(line => (line === '-' ? ' ' : line.replace('-import', ' import').replace('+import', ' import')))
        .filter(line => line !== '+'),
    }))
    .filter(({ lines }) => lines.some(line => line.startsWith('+') || line.startsWith('-')));

  // apply hunk by hunk, since if a hunk fails, the rest of the file will be skipped
  const content = readFileSync(templateFile, 'utf8').toString();
  let applied = content;
  let failures = 0;
  let success = 0;
  for (const hunk of patch.hunks.flatMap(hunk => splitHunk(hunk, contextSize))) {
    const result = applyPatch(applied, { ...patch, hunks: [hunk] }, { fuzzFactor });
    if (result) {
      applied = result;
      success++;
    } else {
      failures++;
    }
  }

  if (content !== applied) {
    writeFileSync(templateFile, applied);
  }

  return { success, failures };
};

export const applyChangesToFileOrCopy = ({ templateFile, oldFileContents, ...opts }: ApplyOptions) => {
  const result = applyChangesToFile({ templateFile, oldFileContents, ...opts });
  if (result.success === 0 && result.failures > 0) {
    let diskContents;
    if (templateFile.endsWith('.ejs')) {
      diskContents = `<%#
 Copyright 2013-2026 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
${oldFileContents}`;
    }
    writeFileSync(templateFile, diskContents ?? oldFileContents, { encoding: 'utf-8' });
  }
};
