import { Component, Input } from '@angular/core';

/**
 * A wrapper directive on top of the translate pipe as the inbuilt translate directive from ng2-translate is too verbose and buggy
 */
@Component({
    selector: '[jhi-translate]',
    template: '<span [innerHTML]="jhiTranslate | translate:translateValues"></span>'
})
export class JhiTranslate {

    @Input('jhi-translate') jhiTranslate: string;

    @Input('translate-values') translateValues: any;

    //FIXME add support to pass translate-compile/ directives in translated content doesnt work
}
