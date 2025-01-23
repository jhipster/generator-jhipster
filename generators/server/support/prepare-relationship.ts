import type { Relationship } from '../../../lib/types/application/relationship.js';
import { mutateData } from '../../../lib/utils/object.js';
import { formatDocAsApiDescription, formatDocAsJavaDoc } from '../../java/support/doc.js';
import type { Entity } from '../../../lib/types/application/index.js';

export function prepareRelationship({ relationship }: { relationship: Relationship; entity: Entity }) {
  if (relationship.documentation) {
    mutateData(relationship, {
      __override__: false,
      relationshipJavadoc: formatDocAsJavaDoc(relationship.documentation, 4),
      relationshipApiDescription: formatDocAsApiDescription(relationship.documentation),
      propertyApiDescription: ({ relationshipApiDescription }) => relationshipApiDescription,
    });
  }
}
