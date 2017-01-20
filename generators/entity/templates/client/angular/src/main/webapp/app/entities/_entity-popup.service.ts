import { Injectable, Component } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { <%= entityClass %> } from './<%= entityFileName %>.model';
import { <%= entityClass %>Service } from './<%= entityFileName %>.service';

@Injectable()
export class <%= entityClass %>PopupService {
    private isOpen = false;
    constructor (
        private modalService: NgbModal,
        private <%= entityInstance %>Service: <%= entityClass %>Service
    ) {}

    open (component: Component, id?: number | any): NgbModalRef {
        if (this.isOpen) {
            return;
        }
        this.isOpen = true;

        if (id) {
            this.<%= entityInstance %>Service.find(id).subscribe(<%= entityInstance %> => this.<%= entityInstance %>ModalRef(component, <%= entityInstance %>));
        } else {
            return this.<%= entityInstance %>ModalRef(component, new <%= entityClass %>());
        }
    }

    <%= entityInstance %>ModalRef(component: Component, <%= entityInstance %>: <%= entityClass %>): NgbModalRef {
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
