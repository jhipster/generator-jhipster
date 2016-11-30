import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Audit } from './audit.model';
import { AuditsService } from './audits.service';
import { ParseLinks } from '../../shared';

@Component({
  selector: '<%=jhiPrefix%>-audit',
  templateUrl: './audits.component.html'
})
export class AuditsComponent implements OnInit {
    audits: Audit[];
    fromDate: string;
    links: any;
    page: number;
    orderProp: string;
    reverse: boolean;
    toDate: string;
    totalItems: number;
    datePipe : DatePipe;

    constructor(private auditsService: AuditsService, private parseLinks: ParseLinks, @Inject(LOCALE_ID) private locale: string){ 
        this.page = 1;
        this.reverse = false;
        this.orderProp = 'timestamp';
        this.datePipe =  new DatePipe(this.locale); //TODO see if there is a better way to inject pipes
    }

    getAudits () {
        return this.sortAudits(this.audits);
    }

    loadPage (page: number) {
        this.page = page;
        this.onChangeDate();
    }

    ngOnInit() {
        this.today();
        this.previousMonth();
        this.onChangeDate();
    }

    onChangeDate () {
        this.auditsService.query({page: this.page - 1, size: 20, fromDate: this.fromDate, toDate: this.toDate}).subscribe(res => {
            this.audits = res.json();
            this.links = this.parseLinks.parse(res.headers.get('link'));
            this.totalItems = + res.headers.get('X-Total-Count');
        });
    }

    previousMonth () {
        let dateFormat:string = 'yyyy-MM-dd';
        let fromDate: Date = new Date();

        if (fromDate.getMonth() === 0) {
            fromDate = new Date(fromDate.getFullYear() - 1, 11, fromDate.getDate());
        } else {
            fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth() - 1, fromDate.getDate());
        }

        this.fromDate = this.datePipe.transform(fromDate, dateFormat);
    }

    today () {
        let dateFormat:string = 'yyyy-MM-dd';
        // Today + 1 day - needed if the current day must be included
        let today: Date = new Date();

        let date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        this.toDate = this.datePipe.transform(date, dateFormat);
    }

    private sortAudits(audits: Audit[]) {
        audits = audits.slice(0).sort((a, b) => {
            if (a[this.orderProp] < b[this.orderProp]) {
                return -1;
            } else if ([b[this.orderProp] < a[this.orderProp]]) {
                return 1;
            } else {
                return 0;
            }
        });

        if(this.reverse) audits.reverse();

        return audits;
    }
}
