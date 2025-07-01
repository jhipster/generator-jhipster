import { mutateData } from '../../../lib/utils/index.js';
import { formatDocAsApiDescription, formatDocAsJavaDoc } from '../../java/support/doc.js';
import type { Entity as ServerEntity, Relationship as ServerRelationship } from '../types.ts';

export function prepareRelationship({ relationship }: { relationship: ServerRelationship; entity: ServerEntity }) {
  if (relationship.documentation) {
    mutateData(relationship, {
      __override__: false,
      relationshipJavadoc: formatDocAsJavaDoc(relationship.documentation, 4),
      relationshipApiDescription: formatDocAsApiDescription(relationship.documentation),
      propertyApiDescription: ({ relationshipApiDescription }) => relationshipApiDescription,
    });
  }
}
