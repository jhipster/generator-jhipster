import { XSRFStrategy, CookieXSRFStrategy } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AuditsService } from './audits/audits.service';
import { <%=jhiPrefixCapitalized%>HealthService } from './health/health.service';
import { LogsService } from './logs/logs.service';
import { ParseLinks } from "../components/util/parse-links.service";

import { FilterPipe } from "../shared/filter.pipe";
import { OrderByPipe } from "../shared/order-by.pipe";
import { TranslatePipe } from '../shared/translate.pipe';

@NgModule({
    imports: [BrowserModule, FormsModule],
    providers: [
        AuditsService,
        <%=jhiPrefixCapitalized%>HealthService,
        LogsService,
        ParseLinks,
        {
            provide: XSRFStrategy,
            useValue:  new CookieXSRFStrategy('CSRF-TOKEN', 'X-CSRF-TOKEN')
        }
    ],
    declarations: [FilterPipe, OrderByPipe, TranslatePipe]
})
export class <%=angularAppName%>AdminModule {}
