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

    constructor(private <%=jhiPrefix%>ConfigurationService:<%=jhiPrefixCapitalized%>ConfigurationService){
        this.configKeys = [];
        this.filter = '';
    }

    getConfigs(): any[] {
        return this.filterConfig(this.configuration);
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
}
