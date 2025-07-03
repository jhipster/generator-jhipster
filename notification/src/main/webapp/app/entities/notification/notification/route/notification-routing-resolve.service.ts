import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { INotification } from '../notification.model';
import { NotificationService } from '../service/notification.service';

const notificationResolve = (route: ActivatedRouteSnapshot): Observable<null | INotification> => {
  const id = route.params.id;
  if (id) {
    return inject(NotificationService)
      .find(id)
      .pipe(
        mergeMap((notification: HttpResponse<INotification>) => {
          if (notification.body) {
            return of(notification.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default notificationResolve;
