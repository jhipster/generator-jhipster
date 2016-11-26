import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { <%=jhiPrefixCapitalized%>MetricsMonitoringModalComponent } from './metrics-modal.component';
import { <%=jhiPrefixCapitalized%>MetricsService } from './metrics.service';

@Component({
    selector: '<%=jhiPrefix%>-metrics',
    templateUrl: 'app/admin/metrics/metrics.component.html',
})
export class <%=jhiPrefixCapitalized%>MetricsMonitoringComponent implements OnInit {
    metrics: any = {};
    cachesStats: any = {};
    servicesStats: any = {};
    updatingMetrics: boolean = true;

    constructor(private modalService: NgbModal, private metricsService:<%=jhiPrefixCapitalized%>MetricsService) {}

    ngOnInit() {
        this.refresh();
    }

    refresh () {
        this.updatingMetrics = true;
        this.metricsService.getMetrics().subscribe((metrics) => {
            this.metrics = metrics;
            this.updatingMetrics = false;
            this.servicesStats = {};
            this.cachesStats = {};
            Object.keys(metrics.timers).forEach((key) => {
                let value = metrics.timers[key];
                if (key.indexOf('web.rest') !== -1 || key.indexOf('service') !== -1) {
                    this.servicesStats[key] = value;
                }
                if (key.indexOf('net.sf.ehcache.Cache') !== -1) {
                    // remove gets or puts
                    let index = key.lastIndexOf('.');
                    let newKey = key.substr(0, index);

                    // Keep the name of the domain
                    index = newKey.lastIndexOf('.');
                    this.cachesStats[newKey] = {
                        'name': newKey.substr(index + 1),
                        'value': value
                    };
                }
            });
        });
    }

    refreshThreadDumpData () {
        this.metricsService.threadDump().subscribe((data) => {
            const modalRef  = this.modalService.open(JhiMetricsMonitoringModalComponent, { size: 'lg'});
            modalRef.componentInstance.threadDump = data;
            modalRef.result.then((result) => {
                console.log(`Closed with: ${result}`);
            }, (reason) => {
                console.log(`Dismissed ${reason}`);
            });
        });
    }

}
