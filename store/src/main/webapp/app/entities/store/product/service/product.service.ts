import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IProduct, NewProduct } from '../product.model';

export type PartialUpdateProduct = Partial<IProduct> & Pick<IProduct, 'id'>;

export type EntityResponseType = HttpResponse<IProduct>;
export type EntityArrayResponseType = HttpResponse<IProduct[]>;

@Injectable({ providedIn: 'root' })
export class ProductService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/products', 'store');

  create(product: NewProduct): Observable<EntityResponseType> {
    return this.http.post<IProduct>(this.resourceUrl, product, { observe: 'response' });
  }

  update(product: IProduct): Observable<EntityResponseType> {
    return this.http.put<IProduct>(`${this.resourceUrl}/${this.getProductIdentifier(product)}`, product, { observe: 'response' });
  }

  partialUpdate(product: PartialUpdateProduct): Observable<EntityResponseType> {
    return this.http.patch<IProduct>(`${this.resourceUrl}/${this.getProductIdentifier(product)}`, product, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IProduct>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IProduct[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getProductIdentifier(product: Pick<IProduct, 'id'>): number {
    return product.id;
  }

  compareProduct(o1: Pick<IProduct, 'id'> | null, o2: Pick<IProduct, 'id'> | null): boolean {
    return o1 && o2 ? this.getProductIdentifier(o1) === this.getProductIdentifier(o2) : o1 === o2;
  }

  addProductToCollectionIfMissing<Type extends Pick<IProduct, 'id'>>(
    productCollection: Type[],
    ...productsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const products: Type[] = productsToCheck.filter(isPresent);
    if (products.length > 0) {
      const productCollectionIdentifiers = productCollection.map(productItem => this.getProductIdentifier(productItem));
      const productsToAdd = products.filter(productItem => {
        const productIdentifier = this.getProductIdentifier(productItem);
        if (productCollectionIdentifiers.includes(productIdentifier)) {
          return false;
        }
        productCollectionIdentifiers.push(productIdentifier);
        return true;
      });
      return [...productsToAdd, ...productCollection];
    }
    return productCollection;
  }
}
