/*
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
 */
import { Component, Input, OnInit } from '@angular/core';
import { JhiConfigService } from '../config.service';
import { JhiModuleConfig } from '../config';
@Component({
    selector: 'jhi-boolean',
    template: `<span
               [ngClass]="value ? classTrue : classFalse"
               [innerHtml]="value ? textTrue : textFalse">
               </span>`
})
export class JhiBooleanComponent implements OnInit {
    @Input() value: boolean;
    @Input() classTrue: string;
    @Input() classFalse: string;
    @Input() textTrue: string;
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
