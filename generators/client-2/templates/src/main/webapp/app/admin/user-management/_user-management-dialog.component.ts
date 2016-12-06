import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User } from './user.model';
import { UserService } from './user.service';
<%_ if (enableTranslation){ _%>
import { <%=jhiPrefixCapitalized%>LanguageService } from '../../shared';
<%_ }_%>
import { EventManager } from '../../shared/service/event-manager.service';


@Component({
    selector: 'user-mgmt-dialog',
    templateUrl: './user-management-dialog.component.html'
})
export class UserMgmtDialogComponent implements OnInit {

    user: User;
    languages: any[];
    authorities: any[];
    isSaving: Boolean;

    constructor(
        public activeModal: NgbActiveModal,
        <%_ if (enableTranslation){ _%>
        private languageService: <%=jhiPrefixCapitalized%>LanguageService,
        <%_ } _%>
        private userService: UserService,
        private eventManager: EventManager
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        <%_ if (enableTranslation){ _%>
        this.languageService.getAll().then((languages) => {
            this.languages = languages;
        });
        <%_ } _%>
    }

    clear () {
        this.activeModal.dismiss('cancel');
    }

    save () {
        this.isSaving = true;
        if (this.user.id !== null) {
            this.userService.update(this.user).subscribe(response => this.onSaveSuccess(response), () => this.onSaveError());
        } else {<% if (!enableTranslation){ %>
            this.user.langKey = 'en';<% } %>
            this.userService.create(this.user).subscribe(response => this.onSaveSuccess(response), () => this.onSaveError());
        }
    }
    private onSaveSuccess (result) {
        this.eventManager.broadcast({ name: 'userListModification', content:'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError () {
        this.isSaving = false;
    }

}
