import { MissingTranslationHandler, MissingTranslationHandlerParams } from 'ng2-translate';

export class <%=jhiPrefixCapitalized%>MissingTranslationHandler implements MissingTranslationHandler {
    handle(params: MissingTranslationHandlerParams): any {
        return `translation-not-found[${params.key}`;
    }
}
