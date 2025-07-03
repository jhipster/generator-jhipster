import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IBlog } from '../blog.model';
import { BlogService } from '../service/blog.service';

const blogResolve = (route: ActivatedRouteSnapshot): Observable<null | IBlog> => {
  const id = route.params.id;
  if (id) {
    return inject(BlogService)
      .find(id)
      .pipe(
        mergeMap((blog: HttpResponse<IBlog>) => {
          if (blog.body) {
            return of(blog.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default blogResolve;
