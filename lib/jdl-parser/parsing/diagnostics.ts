/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 * Licensed under the Apache License, Version 2.0.
 */
import type { ParsedJDLApplications } from '../types/parsed.ts';

import type { SourceRange } from './locations.ts';

export type JDLDiagnostic = {
  ruleId: string;
  severity: 'error' | 'warning';
  message: string;
  range: SourceRange;
};

export type JDLParseResult = {
  /** A recovered document can be incomplete. No AST is returned when the root cannot be recovered. */
  ast: ParsedJDLApplications | undefined;
  diagnostics: JDLDiagnostic[];
};
