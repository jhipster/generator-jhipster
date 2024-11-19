import type { Relationship } from '../../../lib/types/application/relationship.js';
import { mutateData } from '../../../lib/utils/object.js';
import { formatDocAsApiDescription, formatDocAsJavaDoc } from '../../java/support/doc.js';

export function prepareRelationship({ relationship }: { relationship: Relationship; entity: any }) {
  if (relationship.documentation) {
    mutateData(relationship, {
      __override__: false,
      relationshipJavadoc: formatDocAsJavaDoc(relationship.documentation, 4),
      relationshipApiDescription: formatDocAsApiDescription(relationship.documentation),
      propertyApiDescription: ({ relationshipApiDescription }) => relationshipApiDescription,
    });
  }
}
