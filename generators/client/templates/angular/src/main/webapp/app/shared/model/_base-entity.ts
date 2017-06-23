<%_
let pkType = 'Long';
if (databaseType === 'cassandra' || databaseType === 'mongodb') {
    pkType = 'String';
}
_%>
export interface BaseEntity {
    id?: <%= pkType %>;
};
