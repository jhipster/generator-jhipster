/*
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import { Injectable } from '@angular/core';

/**
 * An utility service for data.
 */
@Injectable()
export class DataUtils {

    constructor () {}

    /**
     * Method to abbreviate the text given
     */
    abbreviate (text: string, append = '...') {

        if (text.length < 30) {
            return text;
        }
        return text ? (text.substring(0, 15) + append + text.slice(-10)) : '';
    }

    /**
     * Method to find the byte size of the string provides
     */
    byteSize (base64String: string) {
        return this._formatAsBytes(this._size(base64String));
    }

    private _endsWith(suffix: string, str: string): boolean {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    private _paddingSize(value: string): number {
        if (this._endsWith('==', value)) {
            return 2;
        }
        if (this._endsWith('=', value)) {
            return 1;
        }
        return 0;
    }

    private _size(value: string): number {
        return value.length / 4 * 3 - this._paddingSize(value);
    }

    private _formatAsBytes(size: number): string {
        return size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' bytes';
    }

    /**
     * Method to open file
     */
    openFile (type: string, data: string) {
        window.open('data:' + type + ';base64,' + data, '_blank', 'height=300,width=400');
    }

    /**
     * Method to convert the file to base64
     */
    toBase64 (file: File, cb: Function) {
        let fileReader: FileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = function (e: any) {
            let base64Data = e.target.result.substr(e.target.result.indexOf('base64,') + 'base64,'.length);
            cb(base64Data);
        };
    }
}
