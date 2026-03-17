import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { Language, type Node, Parser } from 'web-tree-sitter';

let parserPromise: Promise<Parser> | null = null;

const getParser = (): Promise<Parser> => {
  if (!parserPromise) {
    parserPromise = (async () => {
      const treeSitterWasmPath = fileURLToPath(import.meta.resolve('web-tree-sitter/web-tree-sitter.wasm'));
      await Parser.init({ locateFile: () => treeSitterWasmPath });

      const javaGrammarWasmPath = fileURLToPath(import.meta.resolve('tree-sitter-java-orchard/tree-sitter-java_orchard.wasm'));
      const javaWasmBytes = readFileSync(javaGrammarWasmPath);
      const Java = await Language.load(javaWasmBytes);

      const parser = new Parser();
      parser.setLanguage(Java);
      return parser;
    })();
  }
  return parserPromise;
};

const getLastIdentifier = (node: Node): string | null => {
  if (node.type === 'identifier') return node.text;
  let lastId: string | null = null;
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i)!;
    if (child.type === 'identifier') {
      lastId = child.text;
    } else if (child.type === 'scoped_identifier') {
      lastId = getLastIdentifier(child);
    }
  }
  return lastId;
};

const getAllIdentifiers = (node: Node): string[] => {
  if (node.type === 'identifier') return [node.text];
  const ids: string[] = [];
  for (let i = 0; i < node.childCount; i++) {
    ids.push(...getAllIdentifiers(node.child(i)!));
  }
  return ids;
};

const getPackageName = (root: Node): string | null => {
  for (let i = 0; i < root.childCount; i++) {
    const child = root.child(i)!;
    if (child.type === 'package_declaration') {
      for (let j = 0; j < child.childCount; j++) {
        const c = child.child(j)!;
        if (c.type === 'scoped_identifier' || c.type === 'identifier') {
          return c.text;
        }
      }
    }
  }
  return null;
};

const collectUsedIdentifiers = (node: Node): Set<string> => {
  const ids = new Set<string>();
  if (node.type === 'import_declaration' || node.type === 'package_declaration') {
    return ids;
  }
  if (node.type === 'identifier' || node.type === 'type_identifier') {
    ids.add(node.text);
  }
  for (let i = 0; i < node.childCount; i++) {
    for (const id of collectUsedIdentifiers(node.child(i)!)) {
      ids.add(id);
    }
  }
  return ids;
};

export const removeUnusedImports = async (content: string): Promise<string> => {
  const parser = await getParser();
  const tree = parser.parse(content);
  if (!tree) return content;

  const root = tree.rootNode;

  const importNodes: Node[] = [];
  for (let i = 0; i < root.childCount; i++) {
    const child = root.child(i)!;
    if (child.type === 'import_declaration') {
      importNodes.push(child);
    }
  }

  if (importNodes.length === 0) {
    return content;
  }

  const filePackage = getPackageName(root);
  const usedIdentifiers = collectUsedIdentifiers(root);

  const unusedImportNodes: Node[] = [];

  for (const importNode of importNodes) {
    let isWildcard = false;
    let scopedId: Node | null = null;

    for (let i = 0; i < importNode.childCount; i++) {
      const child = importNode.child(i)!;
      if (child.type === 'asterisk') {
        isWildcard = true;
      } else if (child.type === 'scoped_identifier' || child.type === 'identifier') {
        scopedId = child;
      }
    }

    if (isWildcard || !scopedId) continue;

    const lastIdentifier = getLastIdentifier(scopedId);
    if (!lastIdentifier) continue;

    const importPackage = getAllIdentifiers(scopedId).slice(0, -1).join('.');

    if (!usedIdentifiers.has(lastIdentifier) || importPackage === filePackage) {
      unusedImportNodes.push(importNode);
    }
  }

  unusedImportNodes.sort((a, b) => b.startIndex - a.startIndex);

  for (const unusedImport of unusedImportNodes) {
    let startIndex = unusedImport.startIndex;
    if (startIndex > 0 && content.charAt(startIndex - 1) === '\n') {
      startIndex--;
    }
    content = `${content.slice(0, startIndex)}${content.slice(unusedImport.endIndex)}`;
  }

  return content;
};
