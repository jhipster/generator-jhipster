import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IUserData } from '../user-data.model';
import { UserDataService } from '../service/user-data.service';

const userDataResolve = (route: ActivatedRouteSnapshot): Observable<null | IUserData> => {
  const id = route.params.id;
  if (id) {
    return inject(UserDataService)
      .find(id)
      .pipe(
        mergeMap((userData: HttpResponse<IUserData>) => {
          if (userData.body) {
            return of(userData.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default userDataResolve;
