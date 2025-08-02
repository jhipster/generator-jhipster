/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { inspect } from 'node:util';
import { describe, expect, it } from 'esmocha';
import type { GetWebappTranslationCallback } from '../../client/translation.js';
import { removeDeclarations, replaceTranslations, replaceVueTranslations } from './translate-vue.ts';

const FULL_BODY = `
<span v-html="t$('activate.messages.success')"><strong>Your user account has been activated.</strong> Please </span>
<b-link :to="'/account/reset/request'" class="alert-link" v-text="t$('login.password.forgot')"
 data-cy="forgetYourPasswordSelector" >Did you forget your password?</b-link>
<span>{{ t$('login.password.forgot') }}"</span>
<span>{{ t$('login.password.forgot1')}}"</span>
<span>{{t$('login.password.forgot2') }}"</span>
<span>{{t$('login.password.forgot3')}}"</span>
<b-form-group :label="t$('login.form.password')" label-for="password">
  <b-form-input
    id="password"
    type="password"
    name="password"
    :placeholder="t$('login.form[\\'password.placeholder\\']')"
    v-model="password"
    data-cy="password"
  >
  </b-form-input>
</b-form-group>

<b-modal ref="removeUser" id="removeUser" :title="t$('entity.delete.title')" @ok="deleteUser()">
  <div class="modal-body">
    <p id="jhi-delete-user-heading" v-text="t$('userManagement.delete.question', { 'login': removeId})">Are you sure you want to delete this user?</p>
  </div>
  <template #modal-footer>
    <div>
      <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()">Cancel</button>
      <button type="button" class="btn btn-primary" id="confirm-delete-user" v-text="t$('entity.action.delete')" @click="deleteUser()">Delete</button>
    </div>
  </template>
</b-modal>

<label class="form-control-label" v-text="t$('entity.action.cancel')" for="entity.action.cancel">Relationship</label>
       <label class="form-control-label" v-text="t$('jhipsterVueApp.mapsIdGrandchildEntityWithoutDTO.date')" for="maps-id-grandchild-entity-without-dto-date">Date</label>

`;
const getWebappTranslation: GetWebappTranslationCallback = (s, data) => `getWebappTranslation('${s}'${data ? `, ${inspect(data)}` : ''})`;

describe('generator - vue - transform', () => {
  describe('removeDeclarations', () => {
    it('should remove i18n declarations', () => {
      expect(
        removeDeclarations({
          content: `
import { useI18n } from 'vue-i18n';
return {
  t$,
  foo,
  t$: useI18n().t,
}
`,
        }),
      ).toMatchInlineSnapshot(`
"
return {
  foo,
}
"
`);
    });
  });
  describe('replaceTranslations', () => {
    it('should replace t$ and interpolate at ts file', () => {
      expect(
        replaceTranslations({
          getWebappTranslation,
          type: 'ts',
          content: `
t$('msg').toString();
t$('msg', {exp:foo}).toString();
t$('msg', { num : 1 }).toString();
t$('msg', {  str  :  'a'  }).toString();
t$('msg', {  exp:foo,num : 1 , str  :  'a'  }).toString();
`,
        }),
      ).toMatchInlineSnapshot(`
"
'getWebappTranslation('msg')';
\`getWebappTranslation('msg', { exp: '\${foo}' })\`;
'getWebappTranslation('msg', { num: 1 })';
'getWebappTranslation('msg', { str: 'a' })';
\`getWebappTranslation('msg', { exp: '\${foo}', num: 1, str: 'a' })\`;
"
`);
    });
    it('should replace t$ and interpolate at vue file', () => {
      expect(
        replaceTranslations({
          type: 'vue',
          getWebappTranslation,
          content: `
t$('msg')
t$('msg', {exp:foo})
t$('msg', { num : 1 })
t$('msg', {  str  :  'a'  })
t$('msg', {  exp:foo,num : 1 , str  :  'a'  })
`,
        }),
      ).toMatchInlineSnapshot(`
"
getWebappTranslation('msg')
getWebappTranslation('msg', { exp: '{{ foo }}' })
getWebappTranslation('msg', { num: 1 })
getWebappTranslation('msg', { str: 'a' })
getWebappTranslation('msg', { exp: '{{ foo }}', num: 1, str: 'a' })
"
`);
    });
  });
  describe('replaceVueTranslations', () => {
    describe('with nested tag', () => {
      it('should throw', () => {
        expect(() =>
          replaceVueTranslations({
            getWebappTranslation,
            body: '<div v-text="t$(\'entity.action.cancel\')" foo=")"><div>fooo</div>fooo</div>',
            enableTranslation: false,
          }),
        ).toThrow(/Nested tags identical to the translated tag are not supported:/);
      });
    });
    describe('with translation disabled', () => {
      it('should return the body without translation attributes', () => {
        expect(replaceVueTranslations({ getWebappTranslation, body: FULL_BODY, enableTranslation: false })).toMatchInlineSnapshot(`
"
<span>getWebappTranslation('activate.messages.success')</span>
<b-link :to="'/account/reset/request'" class="alert-link"
 data-cy="forgetYourPasswordSelector" >getWebappTranslation('login.password.forgot')</b-link>
<span>getWebappTranslation('login.password.forgot')"</span>
<span>getWebappTranslation('login.password.forgot1')"</span>
<span>getWebappTranslation('login.password.forgot2')"</span>
<span>getWebappTranslation('login.password.forgot3')"</span>
<b-form-group label="getWebappTranslation('login.form.password')" label-for="password">
  <b-form-input
    id="password"
    type="password"
    name="password"
    placeholder="getWebappTranslation('login.form['password.placeholder']')"
    v-model="password"
    data-cy="password"
  >
  </b-form-input>
</b-form-group>

<b-modal ref="removeUser" id="removeUser" title="getWebappTranslation('entity.delete.title')" @ok="deleteUser()">
  <div class="modal-body">
    <p id="jhi-delete-user-heading">getWebappTranslation('userManagement.delete.question', { login: '{{ removeId }}' })</p>
  </div>
  <template #modal-footer>
    <div>
      <button type="button" class="btn btn-secondary" @click="closeDialog()">getWebappTranslation('entity.action.cancel')</button>
      <button type="button" class="btn btn-primary" id="confirm-delete-user" @click="deleteUser()">getWebappTranslation('entity.action.delete')</button>
    </div>
  </template>
</b-modal>

<label class="form-control-label" for="entity.action.cancel">getWebappTranslation('entity.action.cancel')</label>
       <label class="form-control-label" for="maps-id-grandchild-entity-without-dto-date">getWebappTranslation('jhipsterVueApp.mapsIdGrandchildEntityWithoutDTO.date')</label>

"
`);
      });
    });

    describe('with translation enabled', () => {
      it('should return the body without translation tags contents', () => {
        expect(replaceVueTranslations({ getWebappTranslation, body: FULL_BODY, enableTranslation: true })).toMatchInlineSnapshot(`
"
<span v-html="t$('activate.messages.success')"></span>
<b-link :to="'/account/reset/request'" class="alert-link" v-text="t$('login.password.forgot')"
 data-cy="forgetYourPasswordSelector" ></b-link>
<span>{{ t$('login.password.forgot') }}"</span>
<span>{{ t$('login.password.forgot1') }}"</span>
<span>{{ t$('login.password.forgot2') }}"</span>
<span>{{ t$('login.password.forgot3') }}"</span>
<b-form-group :label="t$('login.form.password')" label-for="password">
  <b-form-input
    id="password"
    type="password"
    name="password"
    :placeholder="t$('login.form[\\'password.placeholder\\']')"
    v-model="password"
    data-cy="password"
  >
  </b-form-input>
</b-form-group>

<b-modal ref="removeUser" id="removeUser" :title="t$('entity.delete.title')" @ok="deleteUser()">
  <div class="modal-body">
    <p id="jhi-delete-user-heading" v-text="t$('userManagement.delete.question', { 'login': removeId})"></p>
  </div>
  <template #modal-footer>
    <div>
      <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
      <button type="button" class="btn btn-primary" id="confirm-delete-user" v-text="t$('entity.action.delete')" @click="deleteUser()"></button>
    </div>
  </template>
</b-modal>

<label class="form-control-label" v-text="t$('entity.action.cancel')" for="entity.action.cancel"></label>
       <label class="form-control-label" v-text="t$('jhipsterVueApp.mapsIdGrandchildEntityWithoutDTO.date')" for="maps-id-grandchild-entity-without-dto-date"></label>

"
`);
      });
    });
  });
});
