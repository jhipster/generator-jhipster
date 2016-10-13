import { Component, Input } from '@angular/core';

@Component({
    selector: '[jhi-translate],[translate]',
    template: '<span [innerHTML]="key | translate:args"></span>'
})
export class <%=jhiPrefixCapitalized%>Translate {
    private key: string;
    private _jhiTranslate: string;
    private _translate: string;

    @Input('translate-values') args: any;

    @Input('jhi-translate')
    set jhiTranslate(key: string) {
        if (key) {
            this.key = key;
        }
    }

    @Input('translate')
    set translate(key: string) {
        if (key) {
            this.key = key;
        }
    }

    //FIXME add support to pass translate-compile/ directives in translated content doesnt work
}
