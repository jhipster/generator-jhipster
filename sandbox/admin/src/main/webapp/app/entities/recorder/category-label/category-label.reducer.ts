import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { ICategoryLabel, defaultValue } from 'app/shared/model/recorder/category-label.model';

export const ACTION_TYPES = {
  FETCH_CATEGORYLABEL_LIST: 'categoryLabel/FETCH_CATEGORYLABEL_LIST',
  FETCH_CATEGORYLABEL: 'categoryLabel/FETCH_CATEGORYLABEL',
  CREATE_CATEGORYLABEL: 'categoryLabel/CREATE_CATEGORYLABEL',
  UPDATE_CATEGORYLABEL: 'categoryLabel/UPDATE_CATEGORYLABEL',
  PARTIAL_UPDATE_CATEGORYLABEL: 'categoryLabel/PARTIAL_UPDATE_CATEGORYLABEL',
  DELETE_CATEGORYLABEL: 'categoryLabel/DELETE_CATEGORYLABEL',
  RESET: 'categoryLabel/RESET',
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<ICategoryLabel>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false,
};

export type CategoryLabelState = Readonly<typeof initialState>;

// Reducer

export default (state: CategoryLabelState = initialState, action): CategoryLabelState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_CATEGORYLABEL_LIST):
    case REQUEST(ACTION_TYPES.FETCH_CATEGORYLABEL):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_CATEGORYLABEL):
    case REQUEST(ACTION_TYPES.UPDATE_CATEGORYLABEL):
    case REQUEST(ACTION_TYPES.DELETE_CATEGORYLABEL):
    case REQUEST(ACTION_TYPES.PARTIAL_UPDATE_CATEGORYLABEL):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.FETCH_CATEGORYLABEL_LIST):
    case FAILURE(ACTION_TYPES.FETCH_CATEGORYLABEL):
    case FAILURE(ACTION_TYPES.CREATE_CATEGORYLABEL):
    case FAILURE(ACTION_TYPES.UPDATE_CATEGORYLABEL):
    case FAILURE(ACTION_TYPES.PARTIAL_UPDATE_CATEGORYLABEL):
    case FAILURE(ACTION_TYPES.DELETE_CATEGORYLABEL):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.FETCH_CATEGORYLABEL_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.FETCH_CATEGORYLABEL):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_CATEGORYLABEL):
    case SUCCESS(ACTION_TYPES.UPDATE_CATEGORYLABEL):
    case SUCCESS(ACTION_TYPES.PARTIAL_UPDATE_CATEGORYLABEL):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_CATEGORYLABEL):
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

const apiUrl = 'services/recorder/api/category-labels';

// Actions

export const getEntities: ICrudGetAllAction<ICategoryLabel> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_CATEGORYLABEL_LIST,
  payload: axios.get<ICategoryLabel>(`${apiUrl}?cacheBuster=${new Date().getTime()}`),
});

export const getEntity: ICrudGetAction<ICategoryLabel> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_CATEGORYLABEL,
    payload: axios.get<ICategoryLabel>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<ICategoryLabel> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_CATEGORYLABEL,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<ICategoryLabel> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_CATEGORYLABEL,
    payload: axios.put(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const partialUpdate: ICrudPutAction<ICategoryLabel> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.PARTIAL_UPDATE_CATEGORYLABEL,
    payload: axios.patch(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<ICategoryLabel> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_CATEGORYLABEL,
    payload: axios.delete(requestUrl),
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
