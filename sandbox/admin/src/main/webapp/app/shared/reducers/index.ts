import { combineReducers } from 'redux';
import { loadingBarReducer as loadingBar } from 'react-redux-loading-bar';

import locale, { LocaleState } from './locale';
import authentication, { AuthenticationState } from './authentication';
import applicationProfile, { ApplicationProfileState } from './application-profile';

import administration, { AdministrationState } from 'app/modules/administration/administration.reducer';
import userManagement, { UserManagementState } from 'app/modules/administration/user-management/user-management.reducer';
import register, { RegisterState } from 'app/modules/account/register/register.reducer';
import activate, { ActivateState } from 'app/modules/account/activate/activate.reducer';
import password, { PasswordState } from 'app/modules/account/password/password.reducer';
import settings, { SettingsState } from 'app/modules/account/settings/settings.reducer';
import passwordReset, { PasswordResetState } from 'app/modules/account/password-reset/password-reset.reducer';
// prettier-ignore
import searchLabel, {
  SearchLabelState
} from 'app/entities/recorder/search-label/search-label.reducer';
// prettier-ignore
import userGroup, {
  UserGroupState
} from 'app/entities/recorder/user-group/user-group.reducer';
// prettier-ignore
import machineLabel, {
  MachineLabelState
} from 'app/entities/recorder/machine-label/machine-label.reducer';
// prettier-ignore
import channel, {
  ChannelState
} from 'app/entities/recorder/channel/channel.reducer';
// prettier-ignore
import node, {
  NodeState
} from 'app/entities/recorder/node/node.reducer';
// prettier-ignore
import record, {
  RecordState
} from 'app/entities/recorder/record/record.reducer';
// prettier-ignore
import categoryLabel, {
  CategoryLabelState
} from 'app/entities/recorder/category-label/category-label.reducer';
// prettier-ignore
import userProfile, {
  UserProfileState
} from 'app/entities/recorder/user-profile/user-profile.reducer';
/* jhipster-needle-add-reducer-import - JHipster will add reducer here */

export interface IRootState {
  readonly authentication: AuthenticationState;
  readonly locale: LocaleState;
  readonly applicationProfile: ApplicationProfileState;
  readonly administration: AdministrationState;
  readonly userManagement: UserManagementState;
  readonly register: RegisterState;
  readonly activate: ActivateState;
  readonly passwordReset: PasswordResetState;
  readonly password: PasswordState;
  readonly settings: SettingsState;
  readonly searchLabel: SearchLabelState;
  readonly userGroup: UserGroupState;
  readonly machineLabel: MachineLabelState;
  readonly channel: ChannelState;
  readonly node: NodeState;
  readonly record: RecordState;
  readonly categoryLabel: CategoryLabelState;
  readonly userProfile: UserProfileState;
  /* jhipster-needle-add-reducer-type - JHipster will add reducer type here */
  readonly loadingBar: any;
}

const rootReducer = combineReducers<IRootState>({
  authentication,
  locale,
  applicationProfile,
  administration,
  userManagement,
  register,
  activate,
  passwordReset,
  password,
  settings,
  searchLabel,
  userGroup,
  machineLabel,
  channel,
  node,
  record,
  categoryLabel,
  userProfile,
  /* jhipster-needle-add-reducer-combine - JHipster will add reducer here */
  loadingBar,
});

export default rootReducer;
