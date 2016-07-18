import { Component, OnInit } from "@angular/core";
import { <%=jhiPrefixCapitalized%>ConfigurationService } from "./configuration.service";

@Component({
  selector: '<%=jhiPrefix%>-configuration',
  templateUrl: 'app/admin/configuration/configuration.html',
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

    getConfigs(): any[] {
        return this.sortConfig(this.filterConfig(this.configuration));
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

    private filterConfig(configArray: any[]) {
        return configArray.filter(config => {
            return config.prefix.indexOf(this.filter) >= 0;
        });
    }

    private sortConfig(configArray: any[]) {
        configArray = configArray.slice(0).sort((a, b) => {
            if (a[this.orderProp] < b[this.orderProp]) {
              return -1;
            } else if ([b[this.orderProp] < a[this.orderProp]]) {
              return 1;
            } else {
              return 0;
            }
        });

        if(this.reverse) configArray.reverse();

        return configArray;
    }
}
