import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITag } from '../tag.model';
import { TagService } from '../service/tag.service';

const tagResolve = (route: ActivatedRouteSnapshot): Observable<null | ITag> => {
  const id = route.params.id;
  if (id) {
    return inject(TagService)
      .find(id)
      .pipe(
        mergeMap((tag: HttpResponse<ITag>) => {
          if (tag.body) {
            return of(tag.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default tagResolve;
