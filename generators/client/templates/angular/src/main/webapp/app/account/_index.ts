<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
export * from './activate/activate.component';
export * from './activate/activate.service';
export * from './activate/activate.route';
export * from './password/password.component';
export * from './password/password-strength-bar.component';
export * from './password/password.service';
export * from './password/password.route';
export * from './password-reset/finish/password-reset-finish.component';
export * from './password-reset/finish/password-reset-finish.service';
export * from './password-reset/finish/password-reset-finish.route';
export * from './password-reset/init/password-reset-init.component';
export * from './password-reset/init/password-reset-init.service';
export * from './password-reset/init/password-reset-init.route';
export * from './register/register.component';
export * from './register/register.service';
export * from './register/register.route';
<%_ if (authenticationType === 'session') { _%>
export * from './sessions/sessions.component';
export * from './sessions/sessions.service';
export * from './sessions/sessions.route';
export * from './sessions/session.model';
<%_ } _%>
export * from './settings/settings.component';
export * from './settings/settings.route';
<%_ if (enableSocialSignIn) { _%>
	<%_ if (authenticationType == 'jwt') { _%>
export * from './social/social-auth.component';
	<%_ } _%>
export * from './social/social-register.component';
export * from './social/social.route';
<%_ } _%>
export * from './account.route';
