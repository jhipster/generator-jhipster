import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { SortByDirective, SortDirective, SortService, sortStateSignal } from 'app/shared/sort';
import { GatewayRoutesService } from '../gateway/gateway-routes.service';
import { Level, Log, LoggersResponse } from './log.model';
import { LogsService } from './logs.service';

@Component({
  selector: 'jhi-logs',
  templateUrl: './logs.component.html',
  providers: [GatewayRoutesService],
  imports: [SharedModule, FormsModule, SortDirective, SortByDirective],
})
export default class LogsComponent implements OnInit {
  loggers = signal<Log[] | undefined>(undefined);
  isLoading = signal(false);
  filter = signal('');
  sortState = sortStateSignal({ predicate: 'name', order: 'asc' });
  filteredAndOrderedLoggers = computed<Log[] | undefined>(() => {
    let data = this.loggers() ?? [];
    const filter = this.filter();
    if (filter) {
      data = data.filter(logger => logger.name.toLowerCase().includes(filter.toLowerCase()));
    }

    const { order, predicate } = this.sortState();
    if (order && predicate) {
      data = data.sort(this.sortService.startSort({ order, predicate }, { predicate: 'name', order: 'asc' }));
    }
    return data;
  });
  services: string[] = [];
  selectedService: string | undefined = undefined;

  private readonly logsService = inject(LogsService);
  private readonly sortService = inject(SortService);
  private readonly gatewayRoutesService = inject(GatewayRoutesService);

  ngOnInit(): void {
    this.findAndExtractLoggers();
    this.loadServicesOptions();
  }

  changeLevel(name: string, level: Level): void {
    this.logsService.changeLevel(name, level, this.selectedService).subscribe(() => this.findAndExtractLoggers());
  }

  changeService(event: any): void {
    this.selectedService = event.target.value?.replace('Service', '')?.toLowerCase();
    this.findAndExtractLoggers();
  }

  private findAndExtractLoggers(): void {
    this.isLoading.set(true);
    this.logsService
      .findAll(this.selectedService)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (response: LoggersResponse) =>
          this.loggers.set(Object.entries(response.loggers).map(([key, logger]) => new Log(key, logger.effectiveLevel))),
        error: () => this.loggers.set([]),
      });
  }

  private loadServicesOptions(): void {
    this.gatewayRoutesService
      .findAll()
      .pipe(map(routes => routes.map(route => route.serviceId)))
      .pipe(map(services => services.filter(service => service.endsWith('Service'))))
      .subscribe(services => (this.services = services));
  }
}
