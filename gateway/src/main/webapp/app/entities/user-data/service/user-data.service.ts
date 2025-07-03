import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IUserData, NewUserData } from '../user-data.model';

export type PartialUpdateUserData = Partial<IUserData> & Pick<IUserData, 'id'>;

export type EntityResponseType = HttpResponse<IUserData>;
export type EntityArrayResponseType = HttpResponse<IUserData[]>;

@Injectable({ providedIn: 'root' })
export class UserDataService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/user-data');

  create(userData: NewUserData): Observable<EntityResponseType> {
    return this.http.post<IUserData>(this.resourceUrl, userData, { observe: 'response' });
  }

  update(userData: IUserData): Observable<EntityResponseType> {
    return this.http.put<IUserData>(`${this.resourceUrl}/${this.getUserDataIdentifier(userData)}`, userData, { observe: 'response' });
  }

  partialUpdate(userData: PartialUpdateUserData): Observable<EntityResponseType> {
    return this.http.patch<IUserData>(`${this.resourceUrl}/${this.getUserDataIdentifier(userData)}`, userData, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IUserData>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IUserData[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getUserDataIdentifier(userData: Pick<IUserData, 'id'>): number {
    return userData.id;
  }

  compareUserData(o1: Pick<IUserData, 'id'> | null, o2: Pick<IUserData, 'id'> | null): boolean {
    return o1 && o2 ? this.getUserDataIdentifier(o1) === this.getUserDataIdentifier(o2) : o1 === o2;
  }

  addUserDataToCollectionIfMissing<Type extends Pick<IUserData, 'id'>>(
    userDataCollection: Type[],
    ...userDataToCheck: (Type | null | undefined)[]
  ): Type[] {
    const userData: Type[] = userDataToCheck.filter(isPresent);
    if (userData.length > 0) {
      const userDataCollectionIdentifiers = userDataCollection.map(userDataItem => this.getUserDataIdentifier(userDataItem));
      const userDataToAdd = userData.filter(userDataItem => {
        const userDataIdentifier = this.getUserDataIdentifier(userDataItem);
        if (userDataCollectionIdentifiers.includes(userDataIdentifier)) {
          return false;
        }
        userDataCollectionIdentifiers.push(userDataIdentifier);
        return true;
      });
      return [...userDataToAdd, ...userDataCollection];
    }
    return userDataCollection;
  }
}
