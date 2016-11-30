import { Inject, Injectable } from '@angular/core';

@Injectable()
export class DataUtils {

    constructor () {}

    abbreviate (text: string) {
        if (typeof text !== 'string') {
            return '';
        }
        if (text.length < 30) {
            return text;
        }
        return text ? (text.substring(0, 15) + '...' + text.slice(-10)) : '';
    }

    byteSize (base64String: string) {
        if (typeof base64String !== 'string') {
            return '';
        }

        function endsWith(suffix, str) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }

        function paddingSize(base64String) {
            if (endsWith('==', base64String)) {
                return 2;
            }
            if (endsWith('=', base64String)) {
                return 1;
            }
            return 0;
        }

        function size(base64String) {
            return base64String.length / 4 * 3 - paddingSize(base64String);
        }

        function formatAsBytes(size) {
            return size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' bytes';
        }

        return formatAsBytes(size(base64String));
    }

    openFile (type: string, data: string) {
        window.open('data:' + type + ';base64,' + data, '_blank', 'height=300,width=400');
    }

    toBase64 (file: File, cb: Function) {
        let fileReader: FileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = function (e: any) {
            let base64Data = e.target.result.substr(e.target.result.indexOf('base64,') + 'base64,'.length);
            cb(base64Data);
        };
    }
}
