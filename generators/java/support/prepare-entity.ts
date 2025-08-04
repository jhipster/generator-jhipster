import path from 'node:path';

import { mutateData, normalizePathEnd } from '../../../lib/utils/index.ts';
import type { Application as JavaApplication, Entity as JavaEntity } from '../types.ts';

import { formatDocAsApiDescription, formatDocAsJavaDoc } from './doc.ts';

export function prepareEntity(entity: JavaEntity, application: JavaApplication) {
  const { packageFolder, packageName } = application;

  mutateData(entity, {
    __override__: false,
    entityJavaPackageFolder: ({ entityPackage }) => (entityPackage ? `${entityPackage.replace(/\./g, '/')}/` : ''),
    entityAbsoluteFolder: ({ entityJavaPackageFolder }) => normalizePathEnd(path.join(packageFolder, entityJavaPackageFolder!)),
    entityAbsolutePackage: ({ entityPackage }) => (entityPackage ? [packageName, entityPackage].join('.') : packageName),
    entityAbsoluteClass: ({ entityAbsolutePackage, persistClass }) => `${entityAbsolutePackage}.domain.${persistClass}`,
    entityJavadoc: ({ documentation }) => (documentation ? formatDocAsJavaDoc(documentation) : documentation),
    entityApiDescription: ({ documentation }) => (documentation ? formatDocAsApiDescription(documentation) : documentation),
    importApiModelProperty: ({ relationships, fields }) =>
      relationships.some(relationship => relationship.documentation) || fields.some(field => field.documentation),
  });
}
