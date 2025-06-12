import path from 'path';

import { mutateData, normalizePathEnd } from '../../../lib/utils/index.ts';
import type { ApplicationAll } from '../../base-application/application-properties-all.js';
import type { Entity as JavaEntity } from '../types.js';
import { formatDocAsApiDescription, formatDocAsJavaDoc } from './doc.ts';

export function prepareEntity(entity: JavaEntity, application: ApplicationAll) {
  const { packageFolder, packageName } = application;

  mutateData(entity, {
    __override__: false,
    entityJavaPackageFolder: ({ entityPackage }) => (entityPackage ? `${entityPackage.replace(/\./g, '/')}/` : ''),
    entityAbsoluteFolder: ({ entityJavaPackageFolder }) => normalizePathEnd(path.join(packageFolder, entityJavaPackageFolder!)),
    entityAbsolutePackage: ({ entityPackage }) => (entityPackage ? [packageName, entityPackage].join('.') : packageName),
    entityAbsoluteClass: ({ entityAbsolutePackage, persistClass }) => `${entityAbsolutePackage}.domain.${persistClass}`,
    entityJavadoc: ({ documentation }) => (documentation ? formatDocAsJavaDoc(documentation) : documentation),
    entityApiDescription: ({ documentation }) => (documentation ? formatDocAsApiDescription(documentation) : documentation),
  });
}
