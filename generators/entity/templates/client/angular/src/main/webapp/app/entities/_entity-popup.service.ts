<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
import { Injectable, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
<%_ if (fieldsContainInstant || fieldsContainZonedDateTime) { _%>
import { DatePipe } from '@angular/common';
<%_ } _%>
import { <%= entityAngularName %> } from './<%= entityFileName %>.model';
import { <%= entityAngularName %>Service } from './<%= entityFileName %>.service';
<%_
let hasDate = false;
if (fieldsContainInstant || fieldsContainZonedDateTime || fieldsContainLocalDate) {
    hasDate = true;
}
_%>

@Injectable()
export class <%= entityAngularName %>PopupService {
    private isOpen = false;
    constructor(
        <%_ if (fieldsContainInstant || fieldsContainZonedDateTime) { _%>
        private datePipe: DatePipe,
        <%_ } _%>
        private modalService: NgbModal,
        private router: Router,
        private <%= entityInstance %>Service: <%= entityAngularName %>Service

    ) {}

    open(component: Component, id?: number | any): NgbModalRef {
        if (this.isOpen) {
            return;
        }
        this.isOpen = true;

        if (id) {
            this.<%= entityInstance %>Service.find(id).subscribe((<%= entityInstance %>) => {
                <%_ if (hasDate) { _%>
                    <%_ for (idx in fields) { _%>
                        <%_ if (fields[idx].fieldType === 'LocalDate') { _%>
                if (<%= entityInstance %>.<%=fields[idx].fieldName%>) {
                    <%= entityInstance %>.<%=fields[idx].fieldName%> = {
                        year: <%= entityInstance %>.<%=fields[idx].fieldName%>.getFullYear(),
                        month: <%= entityInstance %>.<%=fields[idx].fieldName%>.getMonth() + 1,
                        day: <%= entityInstance %>.<%=fields[idx].fieldName%>.getDate()
                    };
                }
                        <%_ } _%>
                        <%_ if (['Instant', 'ZonedDateTime'].includes(fields[idx].fieldType)) { _%>
                <%= entityInstance %>.<%=fields[idx].fieldName%> = this.datePipe
                    .transform(<%= entityInstance %>.<%=fields[idx].fieldName%>, 'yyyy-MM-ddThh:mm');
                        <%_ } _%>
                <%_ } _%>
                <%_ } _%>
                this.<%= entityInstance %>ModalRef(component, <%= entityInstance %>);
            });
        } else {
            return this.<%= entityInstance %>ModalRef(component, new <%= entityAngularName %>());
        }
    }

    <%_ if (entityInstance.length <= 30) { _%>
    <%= entityInstance %>ModalRef(component: Component, <%= entityInstance %>: <%= entityAngularName %>): NgbModalRef {
    <%_ } else { _%>
    <%= entityInstance %>ModalRef(component: Component,
        <%= entityInstance %>: <%= entityAngularName %>): NgbModalRef {
    <%_ } _%>
        const modalRef = this.modalService.open(component, { size: 'lg', backdrop: 'static'});
        modalRef.componentInstance.<%= entityInstance %> = <%= entityInstance %>;
        modalRef.result.then((result) => {
            this.router.navigate([{ outlets: { popup: null }}], { replaceUrl: true });
            this.isOpen = false;
        }, (reason) => {
            this.router.navigate([{ outlets: { popup: null }}], { replaceUrl: true });
            this.isOpen = false;
        });
        return modalRef;
    }
}
