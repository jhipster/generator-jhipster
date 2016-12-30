import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UIRouterModule } from 'ui-router-ng2';
import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { <%=angular2AppName%>SharedModule } from '../shared';
import {
    entityState,
    /* jhipster-needle-add-entity-to-module-import - JHipster will add entity classes here */
} from './';

let ENTITY_STATES = [
    entityState,
    /* jhipster-needle-add-entity-to-module-states - JHipster will add entity state vars here */
];

@NgModule({
    imports: [
        <%=angular2AppName%>SharedModule,
        InfiniteScrollModule,
        UIRouterModule.forChild({ states: ENTITY_STATES })
    ],
    declarations: [
        /* jhipster-needle-add-entity-to-module-declarations - JHipster will add entity component classes here */
    ],
    entryComponents: [
        /* jhipster-needle-add-entity-to-module-entryComponents - JHipster will add entity dialog classes here */
    ],
    providers: [
        /* jhipster-needle-add-entity-to-module-providers - JHipster will add entity Service classes here */
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class <%=angular2AppName%>EntityModule {}

