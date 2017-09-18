<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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
import { JhiAlertService, JhiHttpInterceptor } from 'ng-jhipster';
import { RequestOptionsArgs, Response } from '@angular/http';
import { Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';

export class NotificationInterceptor extends JhiHttpInterceptor {

    private alertService: JhiAlertService;

    constructor(private injector: Injector) {
        super();
        setTimeout(() => this.alertService = injector.get(JhiAlertService));
    }

    requestIntercept(options?: RequestOptionsArgs): RequestOptionsArgs {
        return options;
    }

    responseIntercept(observable: Observable<Response>): Observable<Response> {
        return observable.map((response: Response) => {
            const headers = [];
            response.headers.forEach((value, name) => {
                if (name.toLowerCase().endsWith('app-alert') || name.toLowerCase().endsWith('app-params')) {
                    headers.push(name);
                }
            });
            if (headers.length > 1) {
                headers.sort();
                const alertKey = response.headers.get(headers[ 0 ]);
                if (typeof alertKey === 'string') {
                    if (this.alertService) {
                        <%_ if (enableTranslation) { _%>
                        const alertParam = headers.length >= 2 ? response.headers.get(headers[ 1 ]) : null;
                        this.alertService.success(alertKey, { param : alertParam }, null);
                        <%_ } else { _%>
                        this.alertService.success(alertKey, null, null);
                        <%_ } _%>
                    }
                }
            }
            return response;
        }).catch((error) => {
            return Observable.throw(error); // here, response is an error
        });
    }
}
