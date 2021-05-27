import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { ISearchLabel, defaultValue } from 'app/shared/model/recorder/search-label.model';

export const ACTION_TYPES = {
  FETCH_SEARCHLABEL_LIST: 'searchLabel/FETCH_SEARCHLABEL_LIST',
  FETCH_SEARCHLABEL: 'searchLabel/FETCH_SEARCHLABEL',
  CREATE_SEARCHLABEL: 'searchLabel/CREATE_SEARCHLABEL',
  UPDATE_SEARCHLABEL: 'searchLabel/UPDATE_SEARCHLABEL',
  PARTIAL_UPDATE_SEARCHLABEL: 'searchLabel/PARTIAL_UPDATE_SEARCHLABEL',
  DELETE_SEARCHLABEL: 'searchLabel/DELETE_SEARCHLABEL',
  RESET: 'searchLabel/RESET',
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<ISearchLabel>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false,
};

export type SearchLabelState = Readonly<typeof initialState>;

// Reducer

export default (state: SearchLabelState = initialState, action): SearchLabelState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_SEARCHLABEL_LIST):
    case REQUEST(ACTION_TYPES.FETCH_SEARCHLABEL):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_SEARCHLABEL):
    case REQUEST(ACTION_TYPES.UPDATE_SEARCHLABEL):
    case REQUEST(ACTION_TYPES.DELETE_SEARCHLABEL):
    case REQUEST(ACTION_TYPES.PARTIAL_UPDATE_SEARCHLABEL):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.FETCH_SEARCHLABEL_LIST):
    case FAILURE(ACTION_TYPES.FETCH_SEARCHLABEL):
    case FAILURE(ACTION_TYPES.CREATE_SEARCHLABEL):
    case FAILURE(ACTION_TYPES.UPDATE_SEARCHLABEL):
    case FAILURE(ACTION_TYPES.PARTIAL_UPDATE_SEARCHLABEL):
    case FAILURE(ACTION_TYPES.DELETE_SEARCHLABEL):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.FETCH_SEARCHLABEL_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.FETCH_SEARCHLABEL):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_SEARCHLABEL):
    case SUCCESS(ACTION_TYPES.UPDATE_SEARCHLABEL):
    case SUCCESS(ACTION_TYPES.PARTIAL_UPDATE_SEARCHLABEL):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_SEARCHLABEL):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {},
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

const apiUrl = 'services/recorder/api/search-labels';

// Actions

export const getEntities: ICrudGetAllAction<ISearchLabel> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_SEARCHLABEL_LIST,
  payload: axios.get<ISearchLabel>(`${apiUrl}?cacheBuster=${new Date().getTime()}`),
});

export const getEntity: ICrudGetAction<ISearchLabel> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_SEARCHLABEL,
    payload: axios.get<ISearchLabel>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<ISearchLabel> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_SEARCHLABEL,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<ISearchLabel> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_SEARCHLABEL,
    payload: axios.put(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const partialUpdate: ICrudPutAction<ISearchLabel> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.PARTIAL_UPDATE_SEARCHLABEL,
    payload: axios.patch(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<ISearchLabel> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_SEARCHLABEL,
    payload: axios.delete(requestUrl),
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
