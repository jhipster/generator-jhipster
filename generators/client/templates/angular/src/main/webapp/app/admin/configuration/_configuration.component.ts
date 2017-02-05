import { Component, OnInit } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';

import { <%=jhiPrefixCapitalized%>ConfigurationService } from './configuration.service';

@Component({
    selector: '<%=jhiPrefix%>-configuration',
    templateUrl: './configuration.component.html'
})
export class <%=jhiPrefixCapitalized%>ConfigurationComponent implements OnInit {
    allConfiguration: any = null;
    configuration: any = null;
    configKeys: any[];
    filter: string;
    orderProp: string;
    reverse: boolean;

    constructor(
        private jhiLanguageService: JhiLanguageService,
        private configurationService: <%=jhiPrefixCapitalized%>ConfigurationService
    ) {
        this.jhiLanguageService.setLocations(['configuration']);
        this.configKeys = [];
        this.filter = '';
        this.orderProp = 'prefix';
        this.reverse = false;
    }

    keys(dict): Array<string> {
        return (dict === undefined) ? [] : Object.keys(dict);
    }

    ngOnInit() {
        this.configurationService.get().subscribe((configuration) => {
            this.configuration = configuration;

            for (let config of configuration) {
                if (config.properties !== undefined) {
                    this.configKeys.push(Object.keys(config.properties));
                }
            }
        });

        this.configurationService.getEnv().subscribe((configuration) => {
            this.allConfiguration = configuration;
        });
    }
}
