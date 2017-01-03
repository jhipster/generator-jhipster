import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: '<%=jhiPrefix%>-main',
    templateUrl: './main.component.html',
    styleUrls: [
    <%_ if (useSass) { _%>
        'main.scss'
    <%_} else { _%>
        'main.css'
    <%_ } _%>
    ],
    encapsulation: ViewEncapsulation.None
})
export class <%=jhiPrefixCapitalized%>MainComponent {}
