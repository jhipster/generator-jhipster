import { Component, OnInit } from "@angular/core";

import { <%=jhiPrefixCapitalized%>ConfigurationService } from "./configuration.service";
import { FilterPipe } from "../../shared/filter.pipe";
import { OrderByPipe } from "../../shared/order-by.pipe";


@Component({
    selector: '<%=jhiPrefix%>-configuration',
    templateUrl: 'app/admin/configuration/configuration.html',
    pipes: [FilterPipe, OrderByPipe],
    providers: [ <%=jhiPrefixCapitalized%>ConfigurationService ]
})
export class <%=jhiPrefixCapitalized%>ConfigurationComponent {
    allConfiguration:any = null;
    configuration:any = null;
    configKeys:any[];
    filter: string;
    orderProp: string;
    reverse: boolean;

    constructor(private <%=jhiPrefix%>ConfigurationService:<%=jhiPrefixCapitalized%>ConfigurationService){
        this.configKeys = [];
        this.filter = '';
        this.orderProp = 'prefix';
        this.reverse = false;
    }


    keys(dict) : Array<string> {
        return Object.keys(dict);
    }

    ngOnInit() {
        this.<%=jhiPrefix%>ConfigurationService.get().subscribe((configuration) => {
            this.configuration = configuration;

            for(var config of configuration) {
                this.configKeys.push(Object.keys(config.properties));
            }
        });

        this.<%=jhiPrefix%>ConfigurationService.getEnv().subscribe((configuration) => {
            this.allConfiguration = configuration;
        });
    }
}
