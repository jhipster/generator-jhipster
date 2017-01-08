import { Component, OnInit } from '@angular/core';
import { Transition } from 'ui-router-ng2';

import { <%= entityClass %> } from './<%= entityFileName %>.model';
import { <%= entityClass %>Service } from './<%= entityFileName %>.service';

@Component({
    selector: '<%= jhiPrefix %>-<%= entityFileName %>-detail',
    templateUrl: './<%= entityFileName %>-detail.component.html'
})
export class <%= entityAngularJSName %>DetailComponent implements OnInit {

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
