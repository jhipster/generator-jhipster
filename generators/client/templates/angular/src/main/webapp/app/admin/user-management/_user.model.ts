export class User {
    constructor(
        public id: any,
        public login: string,
        public firstName: string,
        public lastName: string,
        public email: string,
        public activated: Boolean,
        public langKey: string,
        public authorities: any[],
        public createdBy: string,
        public createdDate: Date,
        public lastModifiedBy: string,
        public lastModifiedDate: Date,
        public password: string
    ) { }
}
