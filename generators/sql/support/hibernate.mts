const dialectForDB: Record<string, string> = {
  mysql: 'org.hibernate.dialect.MySQL8Dialect',
  mariadb: 'org.hibernate.dialect.MariaDB103Dialect',
  postgresql: 'org.hibernate.dialect.PostgreSQLDialect',
  h2Disk: 'org.hibernate.dialect.H2Dialect',
  h2Memory: 'org.hibernate.dialect.H2Dialect',
  oracle: 'org.hibernate.dialect.Oracle12cDialect',
  mssql: 'org.hibernate.dialect.SQLServer2012Dialect',
};

// eslint-disable-next-line import/prefer-default-export
export function getApplicationDialect(databaseType: string): string {
  const dialect = dialectForDB[databaseType];
  if (!dialect) {
    throw new Error(`Unknown database type ${databaseType}`);
  }
  return dialect;
}
