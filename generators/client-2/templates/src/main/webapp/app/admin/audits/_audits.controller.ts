import { Component } from "@angular/core";
import { DatePipe } from "@angular/common";
import { AuditsService } from "./audits.service";
import { ParseLinks } from "../../components/util/parse-links.service";

@Component({
  selector: '<%=jhiPrefix%>-audit',
  templateUrl: './audits.html',
  providers: [ AuditsService, ParseLinks ]
})
export class AuditsController {

    constructor(private auditsService: AuditsService, private parseLinks: ParseLinks,
        private datePipe: DatePipe ){

    }

    audits: any = null;
    fromDate: any = null;
    links: any = null;
    page: number = 1;
    toDate: any = null;
    totalItems: any = null;

    onChangeDate () {
        let dateFormat:string = 'yyyy-MM-dd';
        let fromDate: any = this.datePipe.transform(this.fromDate, dateFormat);
        let toDate: any = this.datePipe.transform(this.toDate, dateFormat);

        this.auditsService.query({page: this.page-1, size: 20, fromDate: fromDate, toDate: toDate},
            (result,headers) => {
            this.audits = result;
            this.links = this.parseLinks.parse(headers('link'));
            this.totalItems = headers('X-Total-Count');
        });
    }

    today () {
        // Today + 1 day - needed if the current day must be included
        let today: any = new Date();
        this.toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    }

    previousMonth () {
        let fromDate: any = new Date();
        if (fromDate.getMonth() === 0) {
            fromDate = new Date(fromDate.getFullYear() - 1, 11, fromDate.getDate());
        } else {
            fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth() - 1, fromDate.getDate());
        }

        fromDate = fromDate;
    }

    loadPage (page: number) {
        page = page;
        this.onChangeDate();
    }

}
