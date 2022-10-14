import { XMLParser } from 'fast-xml-parser';
import { DockerfileParser } from 'dockerfile-ast';

/**
 * Extract properties from pom content
 * @param {string} pomContent
 * @returns {Record<string, string>}
 */
export function getPomProperties(pomContent) {
  return new XMLParser().parse(pomContent).project.properties;
}

/**
 * Extract version properties from pom content
 * @param {string} pomContent
 * @returns {Record<string, string>}
 */
export function getPomVersionProperties(pomContent) {
  return Object.fromEntries(
    Object.entries(getPomProperties(pomContent))
      .filter(([property]) => property.endsWith('.version'))
      .map(([property, value]) => [property.slice(0, -8), value])
  );
}

/**
 * Extract version properties from pom content
 * @param {string} pomContent
 * @returns {Record<string, string>}
 */
export function getDockerfileContainers(dockerfileContent) {
  const dockerfile = DockerfileParser.parse(dockerfileContent);
  const containers = {};
  let imageWithTag;
  let image;
  let tag;
  for (const instruction of dockerfile.getInstructions()) {
    if (instruction.getKeyword() === 'FROM') {
      imageWithTag = instruction.getArgumentsContent();
      const split = instruction.getArgumentsContent().split(':');
      image = split[0];
      tag = split[1];
      containers[image] = imageWithTag;
    } else if (instruction.getKeyword() === 'LABEL') {
      const split = instruction.getArgumentsContent().split('=');
      if (split[0].toUpperCase() === 'ALIAS') {
        containers[split[1]] = imageWithTag;
        containers[`${split[1]}Tag`] = tag;
        containers[`${split[1]}Image`] = image;
      }
    }
  }
  return containers;
}
