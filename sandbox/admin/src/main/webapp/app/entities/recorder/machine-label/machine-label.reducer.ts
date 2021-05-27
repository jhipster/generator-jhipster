import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IMachineLabel, defaultValue } from 'app/shared/model/recorder/machine-label.model';

export const ACTION_TYPES = {
  FETCH_MACHINELABEL_LIST: 'machineLabel/FETCH_MACHINELABEL_LIST',
  FETCH_MACHINELABEL: 'machineLabel/FETCH_MACHINELABEL',
  CREATE_MACHINELABEL: 'machineLabel/CREATE_MACHINELABEL',
  UPDATE_MACHINELABEL: 'machineLabel/UPDATE_MACHINELABEL',
  PARTIAL_UPDATE_MACHINELABEL: 'machineLabel/PARTIAL_UPDATE_MACHINELABEL',
  DELETE_MACHINELABEL: 'machineLabel/DELETE_MACHINELABEL',
  RESET: 'machineLabel/RESET',
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IMachineLabel>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false,
};

export type MachineLabelState = Readonly<typeof initialState>;

// Reducer

export default (state: MachineLabelState = initialState, action): MachineLabelState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_MACHINELABEL_LIST):
    case REQUEST(ACTION_TYPES.FETCH_MACHINELABEL):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_MACHINELABEL):
    case REQUEST(ACTION_TYPES.UPDATE_MACHINELABEL):
    case REQUEST(ACTION_TYPES.DELETE_MACHINELABEL):
    case REQUEST(ACTION_TYPES.PARTIAL_UPDATE_MACHINELABEL):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.FETCH_MACHINELABEL_LIST):
    case FAILURE(ACTION_TYPES.FETCH_MACHINELABEL):
    case FAILURE(ACTION_TYPES.CREATE_MACHINELABEL):
    case FAILURE(ACTION_TYPES.UPDATE_MACHINELABEL):
    case FAILURE(ACTION_TYPES.PARTIAL_UPDATE_MACHINELABEL):
    case FAILURE(ACTION_TYPES.DELETE_MACHINELABEL):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.FETCH_MACHINELABEL_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.FETCH_MACHINELABEL):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_MACHINELABEL):
    case SUCCESS(ACTION_TYPES.UPDATE_MACHINELABEL):
    case SUCCESS(ACTION_TYPES.PARTIAL_UPDATE_MACHINELABEL):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_MACHINELABEL):
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

const apiUrl = 'services/recorder/api/machine-labels';

// Actions

export const getEntities: ICrudGetAllAction<IMachineLabel> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_MACHINELABEL_LIST,
  payload: axios.get<IMachineLabel>(`${apiUrl}?cacheBuster=${new Date().getTime()}`),
});

export const getEntity: ICrudGetAction<IMachineLabel> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_MACHINELABEL,
    payload: axios.get<IMachineLabel>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<IMachineLabel> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_MACHINELABEL,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IMachineLabel> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_MACHINELABEL,
    payload: axios.put(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const partialUpdate: ICrudPutAction<IMachineLabel> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.PARTIAL_UPDATE_MACHINELABEL,
    payload: axios.patch(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<IMachineLabel> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_MACHINELABEL,
    payload: axios.delete(requestUrl),
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
