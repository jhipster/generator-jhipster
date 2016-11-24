import { Component, OnInit } from '@angular/core';

import { <%=jhiPrefixCapitalized%>ConfigurationService } from './configuration.service';

@Component({
    selector: '<%=jhiPrefix%>-configuration',
    templateUrl: './configuration.html'
})
export class <%=jhiPrefixCapitalized%>ConfigurationComponent {
    allConfiguration:any = null;
    configuration:any = null;
    configKeys:any[];
    filter: string;
    orderProp: string;
    reverse: boolean;

    constructor(private configurationService:<%=jhiPrefixCapitalized%>ConfigurationService){
        this.configKeys = [];
        this.filter = '';
        this.orderProp = 'prefix';
        this.reverse = false;
    }


    keys(dict) : Array<string> {
        return Object.keys(dict);
    }

    ngOnInit() {
        this.configurationService.get().subscribe((configuration) => {
            this.configuration = configuration;

            for(var config of configuration) {
                this.configKeys.push(Object.keys(config.properties));
            }
        });

        this.configurationService.getEnv().subscribe((configuration) => {
            this.allConfiguration = configuration;
        });
    }
}
