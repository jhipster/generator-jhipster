import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IUserGroup, defaultValue } from 'app/shared/model/recorder/user-group.model';

export const ACTION_TYPES = {
  FETCH_USERGROUP_LIST: 'userGroup/FETCH_USERGROUP_LIST',
  FETCH_USERGROUP: 'userGroup/FETCH_USERGROUP',
  CREATE_USERGROUP: 'userGroup/CREATE_USERGROUP',
  UPDATE_USERGROUP: 'userGroup/UPDATE_USERGROUP',
  PARTIAL_UPDATE_USERGROUP: 'userGroup/PARTIAL_UPDATE_USERGROUP',
  DELETE_USERGROUP: 'userGroup/DELETE_USERGROUP',
  RESET: 'userGroup/RESET',
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IUserGroup>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false,
};

export type UserGroupState = Readonly<typeof initialState>;

// Reducer

export default (state: UserGroupState = initialState, action): UserGroupState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_USERGROUP_LIST):
    case REQUEST(ACTION_TYPES.FETCH_USERGROUP):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_USERGROUP):
    case REQUEST(ACTION_TYPES.UPDATE_USERGROUP):
    case REQUEST(ACTION_TYPES.DELETE_USERGROUP):
    case REQUEST(ACTION_TYPES.PARTIAL_UPDATE_USERGROUP):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.FETCH_USERGROUP_LIST):
    case FAILURE(ACTION_TYPES.FETCH_USERGROUP):
    case FAILURE(ACTION_TYPES.CREATE_USERGROUP):
    case FAILURE(ACTION_TYPES.UPDATE_USERGROUP):
    case FAILURE(ACTION_TYPES.PARTIAL_UPDATE_USERGROUP):
    case FAILURE(ACTION_TYPES.DELETE_USERGROUP):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.FETCH_USERGROUP_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.FETCH_USERGROUP):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_USERGROUP):
    case SUCCESS(ACTION_TYPES.UPDATE_USERGROUP):
    case SUCCESS(ACTION_TYPES.PARTIAL_UPDATE_USERGROUP):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_USERGROUP):
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

const apiUrl = 'services/recorder/api/user-groups';

// Actions

export const getEntities: ICrudGetAllAction<IUserGroup> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_USERGROUP_LIST,
  payload: axios.get<IUserGroup>(`${apiUrl}?cacheBuster=${new Date().getTime()}`),
});

export const getEntity: ICrudGetAction<IUserGroup> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_USERGROUP,
    payload: axios.get<IUserGroup>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<IUserGroup> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_USERGROUP,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IUserGroup> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_USERGROUP,
    payload: axios.put(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const partialUpdate: ICrudPutAction<IUserGroup> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.PARTIAL_UPDATE_USERGROUP,
    payload: axios.patch(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<IUserGroup> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_USERGROUP,
    payload: axios.delete(requestUrl),
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
