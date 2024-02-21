import { formatDocAsApiDescription, formatDocAsJavaDoc } from '../../java/support/doc.js';

export function prepareRelationship({ relationship }: { relationship: any; entity: any }) {
  if (relationship.documentation) {
    relationship.relationshipJavadoc = formatDocAsJavaDoc(relationship.documentation, 4);
    relationship.relationshipApiDescription = formatDocAsApiDescription(relationship.documentation);
  }
}
