export class Session {
    constructor(
        public series: string,
        public tokenDate: Date,
        public ipAddress: string,
        public userAgent: string
    ) { }
}
