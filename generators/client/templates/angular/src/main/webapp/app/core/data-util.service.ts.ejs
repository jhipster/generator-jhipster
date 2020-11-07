/*
 Copyright 2013-2020 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://www.jhipster.tech/
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
import { ElementRef, Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { FormGroup } from '@angular/forms';

export type JhiFileLoadErrorType = 'not.image' | 'could.not.extract';

export interface JhiFileLoadError {
    message: string;
    key: JhiFileLoadErrorType;
    params?: any;
}

/**
 * An utility service for data.
 */
@Injectable({
    providedIn: 'root'
})
export class JhiDataUtils {
    constructor() {}

    /**
     * Method to abbreviate the text given
     */
    abbreviate(text: string, append = '...'): string {
        if (text.length < 30) {
            return text;
        }
        return text ? text.substring(0, 15) + append + text.slice(-10) : '';
    }

    /**
     * Method to find the byte size of the string provides
     */
    byteSize(base64String: string): string {
        return this.formatAsBytes(this.size(base64String));
    }

    /**
     * Method to open file
     */
    openFile(contentType: string, data: string): void {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            // To support IE and Edge
            const byteCharacters = atob(data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], {
                type: contentType
            });
            window.navigator.msSaveOrOpenBlob(blob);
        } else {
            // Other browsers
            const fileURL = `data:${contentType};base64,${data}`;
            const win = window.open();
            win.document.write(
                '<iframe src="' +
                    fileURL +
                    '" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>'
            );
        }
    }

    /**
     * Method to convert the file to base64
     */
    toBase64(file: File, cb: Function): void {
        const fileReader: FileReader = new FileReader();
        fileReader.onload = function(e: any) {
            const base64Data: string = e.target.result.substr(e.target.result.indexOf('base64,') + 'base64,'.length);
            cb(base64Data);
        };
        fileReader.readAsDataURL(file);
    }

    /**
     * Method to clear the input
     */
    clearInputImage(entity: any, elementRef: ElementRef, field: string, fieldContentType: string, idInput: string): void {
        if (entity && field && fieldContentType) {
            if (Object.prototype.hasOwnProperty.call(entity, field)) {
                entity[field] = null;
            }
            if (Object.prototype.hasOwnProperty.call(entity, fieldContentType)) {
                entity[fieldContentType] = null;
            }
            if (elementRef && idInput && elementRef.nativeElement.querySelector('#' + idInput)) {
                elementRef.nativeElement.querySelector('#' + idInput).value = null;
            }
        }
    }

    /**
     * Sets the base 64 data & file type of the 1st file on the event (event.target.files[0]) in the passed entity object
     * and returns a promise.
     *
     * @param event the object containing the file (at event.target.files[0])
     * @param entity the object to set the file's 'base 64 data' and 'file type' on
     * @param field the field name to set the file's 'base 64 data' on
     * @param isImage boolean representing if the file represented by the event is an image
     * @returns a promise that resolves to the modified entity if operation is successful, otherwise rejects with an error message
     */
    setFileData(event, entity, field: string, isImage: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            if (event && event.target && event.target.files && event.target.files[0]) {
                const file: File = event.target.files[0];
                if (isImage && !file.type.startsWith('image/')) {
                    reject(`File was expected to be an image but was found to be ${file.type}`);
                } else {
                    this.toBase64(file, base64Data => {
                        entity[field] = base64Data;
                        entity[`${field}ContentType`] = file.type;
                        resolve(entity);
                    });
                }
            } else {
                reject(`Base64 data was not set as file could not be extracted from passed parameter: ${event}`);
            }
        });
    }

    /**
     * Sets the base 64 data & file type of the 1st file on the event (event.target.files[0]) in the passed entity object
     * and returns an observable.
     *
     * @param event the object containing the file (at event.target.files[0])
     * @param editForm the form group where the input field is located
     * @param field the field name to set the file's 'base 64 data' on
     * @param isImage boolean representing if the file represented by the event is an image
     * @returns an observable that loads file to form field and completes if sussessful
     *          or returns error as JhiFileLoadError on failure
     */
    loadFileToForm(event: Event, editForm: FormGroup, field: string, isImage: boolean): Observable<void> {
        return new Observable((observer: Observer<void>) => {
            const eventTarget: HTMLInputElement = event.target as HTMLInputElement;
            if (eventTarget.files && eventTarget.files[0]) {
                const file: File = eventTarget.files[0];
                if (isImage && !file.type.startsWith('image/')) {
                    const error: JhiFileLoadError = {
                        message: `File was expected to be an image but was found to be '${file.type}'`,
                        key: 'not.image',
                        params: { fileType: file.type }
                    };
                    observer.error(error);
                } else {
                    const fieldContentType: string = field + 'ContentType';
                    this.toBase64(file, (base64Data: string) => {
                        editForm.patchValue({
                            [field]: base64Data,
                            [fieldContentType]: file.type
                        });
                        observer.next();
                        observer.complete();
                    });
                }
            } else {
                const error: JhiFileLoadError = {
                    message: 'Could not extract file',
                    key: 'could.not.extract',
                    params: { event }
                };
                observer.error(error);
            }
        });
    }

    /**
     * Method to download file
     */
    downloadFile(contentType: string, data: string, fileName: string): void {
        const byteCharacters = atob(data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
            type: contentType
        });
        const tempLink = document.createElement('a');
        tempLink.href = window.URL.createObjectURL(blob);
        tempLink.download = fileName;
        tempLink.target = '_blank';
        tempLink.click();
    }

    private endsWith(suffix: string, str: string): boolean {
        return str.includes(suffix, str.length - suffix.length);
    }

    private paddingSize(value: string): number {
        if (this.endsWith('==', value)) {
            return 2;
        }
        if (this.endsWith('=', value)) {
            return 1;
        }
        return 0;
    }

    private size(value: string): number {
        return (value.length / 4) * 3 - this.paddingSize(value);
    }

    private formatAsBytes(size: number): string {
        return size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' bytes';
    }
}
