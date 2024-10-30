export function prepareEntity({ entity, application }) {
  entity.entityReactState = application.applicationTypeMonolith
    ? entity.entityInstance
    : `${application.lowercaseBaseName}.${entity.entityInstance}`;
}
