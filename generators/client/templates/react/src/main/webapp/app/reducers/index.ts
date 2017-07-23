import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { loadingBarReducer as loadingBar } from 'react-redux-loading-bar';

import locale from './locale';
import layout from './layout';
import authentication from './authentication';
import administration from './administration';
import systemProperties from './system-property';

export default combineReducers({
  authentication,
  locale,
  routing,
  layout,
  administration,
  systemProperties,
  loadingBar
});
