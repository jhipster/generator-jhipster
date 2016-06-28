import { Component, OnInit } from '@angular/core';

import { Log } from './log.model';
import { LogsService } from './logs.service';

@Component({
  selector: '<%=jhiPrefix%>-logs',
  templateUrl: 'app/admin/logs/logs.html'
})
export class LogsComponent implements OnInit {

    loggers: Log[];
    filter: string;
    orderProp: string;
    reverse: boolean;

    constructor ( private logsService: LogsService ) {
        this.filter = '';
        this.orderProp = 'name';
        this.reverse = false;
    }

    ngOnInit() {
        this.logsService.findAll().subscribe(loggers => this.loggers = loggers);
    }

    changeLevel (name: string, level: string) {
        let log = new Log(name, level);
        this.logsService.changeLevel(log).subscribe(loggers => this.loggers = loggers);
    }

    getLoggers() {
        return this.sortLogs(this.filterLogs(this.loggers));
    }

    private filterLogs(loggers: Log[]) {
        return loggers.filter(log => {
            return log.name.indexOf(this.filter) >= 0;
        });
    }

    private sortLogs(loggers: Log[]) {
        loggers = loggers.slice(0).sort((a, b) => {
            if (a[this.orderProp] < b[this.orderProp]) {
              return -1;
            } else if ([b[this.orderProp] < a[this.orderProp]]) {
              return 1;
            } else {
              return 0;
            }
        });

        if(this.reverse) loggers.reverse();

        return loggers;
    }
}
