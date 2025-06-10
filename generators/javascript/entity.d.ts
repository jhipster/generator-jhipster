import type {
  Application as BaseApplicationApplication,
  Entity as BaseApplicationEntity,
  Field as BaseApplicationField,
  Relationship as BaseApplicationRelationship,
} from '../base-application/index.ts';

export { BaseApplicationRelationship as Relationship, BaseApplicationField as Field, BaseApplicationApplication as Application };

export interface Entity<
  F extends BaseApplicationField = BaseApplicationField,
  R extends BaseApplicationRelationship = BaseApplicationRelationship,
> extends BaseApplicationEntity<F, R> {
  entityFileName: string;
  entityFolderName: string;
  entityModelFileName: string;
  entityParentPathAddition: string;
  entityPluralFileName: string;
  entityServiceFileName: string;

  /** Generate only the model at client side for relationships. */
  entityClientModelOnly?: boolean;
  entityAngularName: string;
  entityAngularNamePlural: string;
  entityReactName: string;
  entityStateName: string;
  entityUrl: string;
  entityPage: string;

  paginationPagination: boolean;
  paginationInfiniteScroll: boolean;
  paginationNo: boolean;

  tsKeyType?: string;
  tsSampleWithPartialData?: string;
  tsSampleWithRequiredData?: string;
  tsSampleWithFullData?: string;
  tsSampleWithNewData?: string;
  tsPrimaryKeySamples?: string[];

  entityAngularJSSuffix?: string;
}
