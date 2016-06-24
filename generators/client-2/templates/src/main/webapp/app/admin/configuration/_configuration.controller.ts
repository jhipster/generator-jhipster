import { Component } from "@angular/core";
import { <%=jhiPrefixCapitalized%>ConfigurationService } from "./configuration.service";
import 'rxjs/add/operator/toPromise';

@Component({
  selector: '<%=jhiPrefix%>-configuration',
  templateUrl: './configuration.html',
  providers: [ <%=jhiPrefixCapitalized%>ConfigurationService ]
})
export class <%=jhiPrefixCapitalized%>ConfigurationController {
    constructor(private <%=jhiPrefix%>ConfigurationService:<%=jhiPrefixCapitalized%>ConfigurationService){

    }

    allConfiguration: any = null;
    configuration: any = null;

    init() {
        this.<%=jhiPrefix%>ConfigurationService.get().toPromise().
                then( (configuration) => {
                    this.configuration = configuration;
                });

        this.<%=jhiPrefix%>ConfigurationService.getEnv().toPromise().
                then( (configuration) => {
                    this.allConfiguration = configuration;
                });
    }
}
