import { combineReducers } from 'redux';
import { loadingBarReducer as loadingBar } from 'react-redux-loading-bar';

<%_ if (enableTranslation) { _%>
import locale from './locale';
<%_ } _%>
import layout from './layout';
import authentication from './authentication';
import administration from './administration';
import userManagement from './user-management';
import account from './account';
import activate from './activate';

/* jhipster-needle-add-reducer-import - JHipster will add reducer here */

export default combineReducers({
  authentication,
  <%_ if (enableTranslation) { _%>
  locale,
  <%_ } _%>
  layout,
  administration,
  userManagement,
  account,
  activate,
  /* jhipster-needle-add-reducer-combine - JHipster will add reducer here */
  loadingBar
});
