import { mutateData } from '../../base/support/config.js';
import { formatDocAsApiDescription, formatDocAsJavaDoc } from '../../java/support/doc.js';

export function prepareRelationship({ relationship }: { relationship: any; entity: any }) {
  if (relationship.documentation) {
    mutateData(relationship, {
      __override__: false,
      relationshipJavadoc: formatDocAsJavaDoc(relationship.documentation, 4),
      relationshipApiDescription: formatDocAsApiDescription(relationship.documentation),
      propertyApiDescription: ({ relationshipApiDescription }) => relationshipApiDescription,
    });
  }
}
