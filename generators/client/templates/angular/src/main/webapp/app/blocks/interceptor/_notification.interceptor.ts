<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

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
import { JhiAlertService } from 'ng-jhipster';
import { HttpInterceptor, HttpRequest, HttpErrorResponse, HttpResponse, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';

export class NotificationInterceptor implements HttpInterceptor {

    // tslint:disable-next-line: no-unused-variable
    constructor(private alertService: JhiAlertService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).do((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                const arr = event.headers.keys();
                let alert = null;
                let alertParams = null;
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].endsWith('app-alert')) {
                        alert = event.headers.get(arr[i]);
                    } else if (arr[i].endsWith('app-params')) {
                        alertParams = event.headers.get(arr[i]);
                    }
                }
                if (alert) {
                    if (typeof alert === 'string') {
                        if (this.alertService) {
                            <%_ if (enableTranslation) { _%>
                                const alertParam = alertParams;
                                this.alertService.success(alert, { param : alertParam }, null);
                                <%_ } else { _%>
                            this.alertService.success(alert, null, null);
                                <%_ } _%>
                        }
                    }
                }
            }
        }, (err: any) => {
            if (err instanceof HttpErrorResponse) {
                // error
            }
        });
    }
}
