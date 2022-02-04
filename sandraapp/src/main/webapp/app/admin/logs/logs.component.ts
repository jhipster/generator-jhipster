import { Component, OnInit } from '@angular/core';

import { Log, LoggersResponse, Level } from './log.model';
import { LogsService } from './logs.service';

@Component({
  selector: 'jhi-logs',
  templateUrl: './logs.component.html',
})
export class LogsComponent implements OnInit {
  loggers?: Log[];
  filter = '';
  orderProp = 'name';
  reverse = false;

  constructor(private logsService: LogsService) {}

  ngOnInit(): void {
    this.findAndExtractLoggers();
  }

  changeLevel(name: string, level: Level): void {
    this.logsService.changeLevel(name, level).subscribe(() => this.findAndExtractLoggers());
  }

  private findAndExtractLoggers(): void {
    this.logsService
      .findAll()
      .subscribe(
        (response: LoggersResponse) =>
          (this.loggers = Object.entries(response.loggers).map(([key, logger]) => new Log(key, logger.effectiveLevel)))
      );
  }
}
