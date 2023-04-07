export default function matchEntity(jdlEntity) {
  return jdlEntity && jdlEntity.name && jdlEntity.tableName && jdlEntity.fields;
}
