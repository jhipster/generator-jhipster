import { Component, OnInit } from '@angular/core';

import { <%= entityClass %> } from './<%= entityFileName %>.model';
import { <%= entityClass %>Service } from './<%= entityFileName %>.service';

import { Transition } from 'ui-router-ng2';

@Component({
    selector: '<%= entityFileName %>-mgmt-detail',
    templateUrl: './<%= entityFileName %>-management-detail.component.html'
})
export class <%= entityClass %>MgmtDetailComponent implements OnInit {

    <%= entityInstance %>: <%= entityClass %>;

    constructor(private <%= entityInstance %>Service: <%= entityClass %>Service, private trans: Transition) { }

    ngOnInit() {
        this.load(this.trans.params()['id']);
    }

    load (id) {
        this.<%= entityInstance %>Service.find(id).subscribe(<%= entityInstance %> => {
            this.<%= entityInstance %> = <%= entityInstance %>;
        });
    }

}
