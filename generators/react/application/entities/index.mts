// eslint-disable-next-line import/prefer-default-export
export function prepareEntity({ entity, application }) {
  entity.entityReactState = application.applicationTypeMonolith
    ? entity.entityInstance
    : `${application.lowercaseBaseName}.${entity.entityInstance}`;
}
