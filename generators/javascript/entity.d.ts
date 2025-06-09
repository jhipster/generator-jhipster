// TODO extends base Entity
export type Entity = {
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
};
