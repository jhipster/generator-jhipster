import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

import locale from './locale';
import authentication from './authentication';
import administration from './administration';

export default combineReducers({
  authentication,
  locale,
  routing,
  administration
});
