import { Component, OnInit } from '@angular/core';

import { FilterPipe } from "../../shared/filter.pipe";
import { Log } from './log.model';
import { LogsService } from './logs.service';
import { OrderByPipe } from "../../shared/order-by.pipe";

@Component({
    selector: '<%=jhiPrefix%>-logs',
    templateUrl: 'app/admin/logs/logs.html',
    pipes: [FilterPipe, OrderByPipe]
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
        this.logsService.changeLevel(log).subscribe(() => {
            this.logsService.findAll().subscribe(loggers => this.loggers = loggers);
        });
    }
}
