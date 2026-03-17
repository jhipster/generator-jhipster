import { type CstElement, type CstNode, parse } from 'java-parser';

const skippedTypes = ['packageDeclaration', 'importDeclaration'];

/**
 * Lazy implementation of used global identifiers collector.
 * @param cstNode
 * @returns
 */
export const collectGlobalIdentifiersNodes = (cstNode: CstNode): string[] => {
  const nodes = [cstNode];
  const identifiers: Set<string> = new Set();

  for (let node; (node = nodes.shift()); ) {
    for (const identifier of Object.keys(node.children)) {
      node.children[identifier]
        .filter((element: CstElement) => !(element as any).name || !skippedTypes.includes((element as any).name))
        .forEach((element: CstElement) => {
          if ('image' in element) {
            if (element.image) {
              const tokenTypes = [element.tokenType];
              if (Array.isArray(element.tokenType.LONGER_ALT)) {
                tokenTypes.push(...element.tokenType.LONGER_ALT);
              } else if (element.tokenType.LONGER_ALT) {
                tokenTypes.push(element.tokenType.LONGER_ALT);
              }
              if (tokenTypes.some(({ name, isParent }) => name === 'Identifier' && isParent)) {
                const categories = tokenTypes.map(({ CATEGORIES }) => CATEGORIES).flat();
                if (!categories.some(cat => cat?.name === 'Keyword')) {
                  identifiers.add(element.image);
                }
              }
            }
          } else {
            nodes.push(element);
          }
        });
    }
  }
  return [...identifiers];
};

export const removeUnusedImports = (content: string) => {
  const cstNode = parse(content);
  const importDeclarationNodes: any[] = (cstNode.children.ordinaryCompilationUnit[0] as any).children.importDeclaration;
  if (!importDeclarationNodes) {
    return content;
  }
  const filePackage = (cstNode.children.ordinaryCompilationUnit[0] as any).children.packageDeclaration[0].children.Identifier.map(
    (identifier: any) => identifier.image,
  ).join('.');
  const identifiers = collectGlobalIdentifiersNodes(cstNode);
  const unusedImportNodes: any[] = importDeclarationNodes
    .filter(importDec => !importDec.children.Star && !importDec.children.emptyStatement)
    .map(imp => {
      const packageOrTypeName = imp.children.packageOrTypeName[0];
      return [packageOrTypeName.children.Identifier[packageOrTypeName.children.Identifier.length - 1].image, imp];
    })
    .filter(
      ([identifier, importDec]) =>
        !identifiers.includes(identifier) ||
        importDec.children.packageOrTypeName[0].children.Identifier.map((el: any) => el.image)
          .slice(0, -1)
          .join('.') === filePackage,
    )
    .map(([_identifier, impNode]) => impNode);

  // Reverse
  unusedImportNodes.sort((a, b) => b.location.startOffset - a.location.startOffset);

  for (const unusedImport of unusedImportNodes) {
    let { startOffset } = unusedImport.location;
    if (content.charAt(startOffset - 1) === '\n') {
      startOffset--;
    }
    content = `${content.slice(0, startOffset)}${content.slice(unusedImport.location.endOffset + 1)}`;
  }
  return content;
};
