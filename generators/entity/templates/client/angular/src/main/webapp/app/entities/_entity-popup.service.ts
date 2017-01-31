import { Injectable, Component } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
<%_ if (fieldsContainZonedDateTime) { _%>
import { DatePipe } from '@angular/common';
<%_ } _%>
import { <%= entityClass %> } from './<%= entityFileName %>.model';
import { <%= entityClass %>Service } from './<%= entityFileName %>.service';
<%_
var hasDate = false;
if (fieldsContainZonedDateTime || fieldsContainLocalDate) {
    hasDate = true;
}
_%>
@Injectable()
export class <%= entityClass %>PopupService {
    private isOpen = false;
    constructor (
        <%_ if (fieldsContainZonedDateTime) { _%>
        private datePipe: DatePipe,
        <%_ } _%>
        private modalService: NgbModal,
        private <%= entityInstance %>Service: <%= entityClass %>Service
    ) {}

    open (component: Component, id?: number | any): NgbModalRef {
        if (this.isOpen) {
            return;
        }
        this.isOpen = true;

        if (id) {
            this.<%= entityInstance %>Service.find(id).subscribe(<%= entityInstance %> => {
                <%_ if (hasDate) { _%>
                    <%_ for (idx in fields) { _%>
                        <%_ if (fields[idx].fieldType == 'LocalDate') { _%>
                if (<%= entityInstance %>.<%=fields[idx].fieldName%>) {
                    <%= entityInstance %>.<%=fields[idx].fieldName%> = {
                        year: <%= entityInstance %>.<%=fields[idx].fieldName%>.getFullYear(),
                        month: <%= entityInstance %>.<%=fields[idx].fieldName%>.getMonth() + 1,
                        day: <%= entityInstance %>.<%=fields[idx].fieldName%>.getDate()
                    };
                }
                        <%_ } _%>
                        <%_ if (fields[idx].fieldType == 'ZonedDateTime') { _%>
                <%= entityInstance %>.<%=fields[idx].fieldName%> = this.datePipe.transform(<%= entityInstance %>.<%=fields[idx].fieldName%>, 'yyyy-MM-ddThh:mm');
                        <%_ } _%>
                <%_ } _%>
                <%_ } _%>
                this.<%= entityInstance %>ModalRef(component, <%= entityInstance %>);
            });
        } else {
            return this.<%= entityInstance %>ModalRef(component, new <%= entityClass %>());
        }
    }

    <%_ if (entityInstance.length <= 30) { _%>
    <%= entityInstance %>ModalRef(component: Component, <%= entityInstance %>: <%= entityClass %>): NgbModalRef {
    <%_ } else { _%>
    <%= entityInstance %>ModalRef(component: Component,
        <%= entityInstance %>: <%= entityClass %>): NgbModalRef {
    <%_ } _%>
        let modalRef = this.modalService.open(component, { size: 'lg', backdrop: 'static'});
        modalRef.componentInstance.<%= entityInstance %> = <%= entityInstance %>;
        modalRef.result.then(result => {
            console.log(`Closed with: ${result}`);
            this.isOpen = false;
        }, (reason) => {
            console.log(`Dismissed ${reason}`);
            this.isOpen = false;
        });
        return modalRef;
    }
}
