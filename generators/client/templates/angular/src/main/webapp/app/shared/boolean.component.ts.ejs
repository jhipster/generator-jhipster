/*
 Copyright 2013-2020 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://www.jhipster.tech/
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
 */
import { Component, Input, OnInit } from '@angular/core';
import { JhiModuleConfig } from '../config';
import { JhiConfigService } from '../config.service';

/**
 * This component can be used to display a boolean value by defining the @Input attributes
 * If an attribute is not provided, default values will be applied (see JhiModuleConfig class)
 * Have a look at the following examples
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * <jhi-boolean [value]="inputBooleanVariable"></jhi-boolean>
 *
 * - Display a green check when inputBooleanVariable is true
 * - Display a red cross when inputBooleanVariable is false
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * <jhi-boolean
 *     [value]="inputBooleanVariable">
 *     classTrue="fa fa-lg fa-check text-primary"
 *     classFalse="fa fa-lg fa-times text-warning"
 * </jhi-boolean>
 *
 * - Display a blue check when inputBooleanVariable is true
 * - Display an orange cross when inputBooleanVariable is false
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * <jhi-boolean
 *     [value]="inputBooleanVariable">
 *     classTrue="fa fa-lg fa-check"
 *     classFalse=""
 * </jhi-boolean>
 *
 * - Display a black check when inputBooleanVariable is true
 * - Do not display anything when inputBooleanVariable is false
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * <jhi-boolean
 *     [value]="inputBooleanVariable"
 *     [textTrue]="'userManagement.activated' | translate"
 *     textFalse="deactivated">
 * </jhi-boolean>
 *
 * - Display a green badge when inputBooleanVariable is true
 * - Display a red badge when inputBooleanVariable is false
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * <jhi-boolean
 *     [value]="user.activated"
 *     classTrue="badge badge-warning"
 *     classFalse="badge badge-info"
 *     [textTrue]="'userManagement.activated' | translate"
 *     textFalse="deactivated">
 * </jhi-boolean>
 *
 * - Display an orange badge and write 'activated' when inputBooleanVariable is true
 * - Display a blue badge and write 'deactivated' when inputBooleanVariable is false
 */
@Component({
    selector: 'jhi-boolean',
    template: `
        <span [ngClass]="value ? classTrue : classFalse" [innerHtml]="value ? textTrue : textFalse"> </span>
    `
})
export class JhiBooleanComponent implements OnInit {
    /**
     * the boolean input value
     */
    @Input() value: boolean;

    /**
     * the class(es) (space separated) that will be applied if value is true
     */
    @Input() classTrue: string;

    /**
     * the class(es) (space separated) that will be applied if the input value is false
     */
    @Input() classFalse: string;

    /**
     * the text that will be displayed if the input value is true
     */
    @Input() textTrue: string;

    /**
     * the text that will be displayed if the input value is false
     */
    @Input() textFalse: string;

    config: JhiModuleConfig;

    constructor(configService: JhiConfigService) {
        this.config = configService.getConfig();
    }

    ngOnInit() {
        if (this.textTrue === undefined) {
            if (this.classTrue === undefined) {
                this.classTrue = this.config.classTrue;
            }
        } else {
            if (this.classTrue === undefined) {
                this.classTrue = this.config.classBadgeTrue;
            }
        }

        if (this.textFalse === undefined) {
            if (this.classFalse === undefined) {
                this.classFalse = this.config.classFalse;
            }
        } else {
            if (this.classFalse === undefined) {
                this.classFalse = this.config.classBadgeFalse;
            }
        }
    }
}
