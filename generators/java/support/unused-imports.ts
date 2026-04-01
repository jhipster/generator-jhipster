import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { Language, type Node, Parser } from 'web-tree-sitter';

let parserPromise: Promise<Parser> | null = null;

/**
 * Returns a singleton promise that initialises and caches the tree-sitter Java parser.
 * The WebAssembly binaries are loaded lazily on the first call.
 *
 * @returns a promise resolving to the configured tree-sitter {@link Parser}
 */
const getParser = (): Promise<Parser> => {
  parserPromise ??= (async () => {
    const treeSitterWasmPath = fileURLToPath(import.meta.resolve('web-tree-sitter/web-tree-sitter.wasm'));
    await Parser.init({ locateFile: () => treeSitterWasmPath });

    const bundledWasmPath = fileURLToPath(new URL('tree-sitter-java_orchard.wasm', import.meta.url));
    const javaGrammarWasmPath =
      existsSync(bundledWasmPath) ? bundledWasmPath : (
        fileURLToPath(import.meta.resolve('tree-sitter-java-orchard/tree-sitter-java_orchard.wasm'))
      );
    const javaWasmBytes = readFileSync(javaGrammarWasmPath);
    const Java = await Language.load(javaWasmBytes);

    const parser = new Parser();
    parser.setLanguage(Java);
    return parser;
  })();
  return parserPromise;
};

/**
 * Recursively finds the last (rightmost) identifier text in a tree-sitter node.
 *
 * @param node the tree-sitter node to search
 * @returns the text of the last identifier, or `null` if none was found
 */
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

/**
 * Recursively collects all identifier texts from a tree-sitter node and its descendants.
 *
 * @param node the tree-sitter node to traverse
 * @returns an array of all identifier texts found in the subtree
 */
const getAllIdentifiers = (node: Node): string[] => {
  if (node.type === 'identifier') return [node.text];
  const ids: string[] = [];
  for (let i = 0; i < node.childCount; i++) {
    ids.push(...getAllIdentifiers(node.child(i)!));
  }
  return ids;
};

/**
 * Extracts the package name from the root node of a parsed Java compilation unit.
 *
 * @param root the root tree-sitter node of the compilation unit
 * @returns the package name as a dot-separated string, or `null` if no package declaration is present
 */
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

/**
 * Recursively collects all identifiers and type identifiers referenced in a tree-sitter node,
 * skipping `import_declaration` and `package_declaration` subtrees.
 *
 * @param node the tree-sitter node to traverse
 * @returns a {@link Set} of identifier texts that are used within the given node
 */
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

/**
 * Removes unused import declarations from Java source code.
 * Wildcard imports are always kept. A non-wildcard import is considered unused when its
 * last identifier is not referenced elsewhere in the file, or when its package matches
 * the file's own package declaration.
 *
 * @param content the Java source file content
 * @returns the source content with unused imports removed
 */
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
