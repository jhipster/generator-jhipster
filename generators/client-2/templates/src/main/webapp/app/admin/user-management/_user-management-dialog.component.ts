import { Component, OnInit, Inject } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { User } from './user.model';
import { UserService } from './user.service';
<%_ if (enableTranslation){ _%>
import { <%=jhiPrefixCapitalized%>LanguageService } from '../../shared';
<%_ }_%>

@Component({
    selector: 'user-mgmt-dialog',
    templateUrl: 'app/admin/user-management/user-management-dialog.html',
    inputs: ['modalRef', 'dismiss']
})
export class UserMgmtDialogComponent implements OnInit {

    user: User;
    modalRef: NgbModalRef;
    languages: any[];
    authorities: any[];
    isSaving: Boolean;

    constructor(private userService: UserService, @Inject('$stateParams') private $stateParams<%_ if (enableTranslation){ _%>, @Inject('$translate') private $translate,
    private languageService: <%=jhiPrefixCapitalized%>LanguageService <%_ } _%>) {
    }

    ngOnInit() {
        this.userService.find(this.$stateParams.login).subscribe(response => this.user = response.json());
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        <%_ if (enableTranslation){ _%>
        this.languageService.getAll().then((languages) => {
            this.languages = languages;
        });
        <%_ } _%>
    }

    clear () {
        this.modalRef.dismiss('cancel');
    }

    save () {
        this.isSaving = true;
        if (this.user.id !== null) {
            this.userService.update(this.user).subscribe((response) => this.onSaveSuccess, () => this.onSaveError);
        } else {<% if (!enableTranslation){ %>
            this.user.langKey = 'en';<% } %>
            this.userService.create(this.user).subscribe((response) => this.onSaveSuccess, () => this.onSaveError);
        }
    }
    private onSaveSuccess (result) {
        this.isSaving = false;
        this.modalRef.dismiss(result);
    }

    private onSaveError () {
        this.isSaving = false;
    }

}
