import { Component } from '@angular/core';

@Component({
    selector: '[jhi-translate],[jhiTranslate]',
    template: '<span [innerHTML]="key | translate:args"></span>',
    inputs: ['key:jhi-translate', 'args:translate-values']
})
export class <%=jhiPrefixCapitalized%>Translate {

    private key: string;
    private args: any;
    //FIXME add support to pass translate-compile/ directives in translated content doesnt work
}
