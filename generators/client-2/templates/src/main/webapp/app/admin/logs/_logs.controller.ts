import { Component } from "@angular/core";
import { LogsService } from "./logs.service";

@Component({
  selector: '<%=jhiPrefix%>-logs',
  templateUrl: './logs.html',
  providers: [ LogsService ]
})
export class LogsController {

    constructor ( private logsService: LogsService ) {}

    loggers: any = this.logsService.findAll();

    changeLevel ( name: string, level: string ){
        this.logsService.changeLevel( {name:name,level:level}, () =>{
            this.loggers = this.logsService.findAll();
        });
    }

}