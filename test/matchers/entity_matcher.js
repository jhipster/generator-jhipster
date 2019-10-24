module.exports = {
  matchEntity
};

function matchEntity(jdlEntity) {
  return jdlEntity && jdlEntity.name && jdlEntity.tableName && jdlEntity.fields;
}
