export function numberOfBytes(base64String: string) {
    return base64String.length / 4 * 3 - paddingSize(base64String);

    function endsWith(suffix: string, str: string) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    function paddingSize(value: string) {
        if (endsWith('==', value)) {
            return 2;
        }
        if (endsWith('=', value)) {
            return 1;
        }
        return 0;
    }
}
