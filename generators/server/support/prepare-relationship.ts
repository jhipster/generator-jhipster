import type { RelationshipAll } from '../../base-application/relationship-all.js';
import { mutateData } from '../../../lib/utils/index.js';
import { formatDocAsApiDescription, formatDocAsJavaDoc } from '../../java/support/doc.js';
import type { EntityAll } from '../../base-application/entity-all.js';

export function prepareRelationship({ relationship }: { relationship: RelationshipAll; entity: EntityAll }) {
  if (relationship.documentation) {
    mutateData(relationship, {
      __override__: false,
      relationshipJavadoc: formatDocAsJavaDoc(relationship.documentation, 4),
      relationshipApiDescription: formatDocAsApiDescription(relationship.documentation),
      propertyApiDescription: ({ relationshipApiDescription }) => relationshipApiDescription,
    });
  }
}
