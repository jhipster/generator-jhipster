/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { jestExpect as expect } from 'mocha-expect-snapshot';

import { replaceTranslationTags } from './translate-vue.mjs';

const FULL_BODY = `
<input v-text="t$('entity.action.cancel')"/>fooo<bar>
<span v-html="t$('activate.messages.success')"><strong>Your user account has been activated.</strong> Please </span>
<b-link :to="'/account/reset/request'" class="alert-link" v-text="t$('login.password.forgot')"
 data-cy="forgetYourPasswordSelector" >Did you forget your password?</b-link>
<b-form-group v-bind:label="t$('login.form.password')" label-for="password">
  <b-form-input
    id="password"
    type="password"
    name="password"
    v-bind:placeholder="t$('login.form[\\'password.placeholder\\']')"
    v-model="password"
    data-cy="password"
  >
  </b-form-input>
</b-form-group>

<b-modal ref="removeUser" id="removeUser" v-bind:title="t$('entity.delete.title')" @ok="deleteUser()">
  <div class="modal-body">
    <p id="jhi-delete-user-heading" v-text="t$('userManagement.delete.question', { 'login': removeId})">Are you sure you want to delete this user?</p>
  </div>
  <div slot="modal-footer">
    <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" v-on:click="closeDialog()">Cancel</button>
    <button type="button" class="btn btn-primary" id="confirm-delete-user" v-text="t$('entity.action.delete')" v-on:click="deleteUser()">Delete</button>
  </div>
</b-modal>

<span v-bind:value="t$('sessions.title')"></span>
<label class="form-control-label" v-text="t$('entity.action.cancel')" for="entity.action.cancel">Relationship</label>
       <label class="form-control-label" v-text="t$('jhipsterVueApp.mapsIdGrandchildEntityWithoutDTO.date')" for="maps-id-grandchild-entity-without-dto-date">Date</label>

`;

describe('generator - vue - transform', () => {
  describe('replaceTranslationTags', () => {
    describe('with nested tag', () => {
      it('should throw', () => {
        expect(() =>
          replaceTranslationTags({
            body: '<div v-text="t$(\'entity.action.cancel\')" foo=")"><div>fooo</div>fooo</div>',
            enableTranslation: false,
          })
        ).toThrow(/Nested tags identical to the translated tag are not supported:/);
      });
    });
    describe('with translation disabled', () => {
      it('should return the body without translation attributes', () => {
        expect(replaceTranslationTags({ body: FULL_BODY, enableTranslation: false })).toMatchInlineSnapshot(`
"
<input/>fooo<bar>
<span><strong>Your user account has been activated.</strong> Please </span>
<b-link :to="'/account/reset/request'" class="alert-link"
 data-cy="forgetYourPasswordSelector" >Did you forget your password?</b-link>
<b-form-group label-for="password">
  <b-form-input
    id="password"
    type="password"
    name="password"
    v-model="password"
    data-cy="password"
  >
  </b-form-input>
</b-form-group>

<b-modal ref="removeUser" id="removeUser" @ok="deleteUser()">
  <div class="modal-body">
    <p id="jhi-delete-user-heading">Are you sure you want to delete this user?</p>
  </div>
  <div slot="modal-footer">
    <button type="button" class="btn btn-secondary" v-on:click="closeDialog()">Cancel</button>
    <button type="button" class="btn btn-primary" id="confirm-delete-user" v-on:click="deleteUser()">Delete</button>
  </div>
</b-modal>

<span></span>
<label class="form-control-label" for="entity.action.cancel">Relationship</label>
       <label class="form-control-label" for="maps-id-grandchild-entity-without-dto-date">Date</label>

"
`);
      });
    });

    describe('with translation enabled', () => {
      it('should return the body without translation tags contents', () => {
        expect(replaceTranslationTags({ body: FULL_BODY, enableTranslation: true })).toMatchInlineSnapshot(`
"
<input v-text="t$('entity.action.cancel')"/>fooo<bar>
<span v-html="t$('activate.messages.success')"></span>
<b-link :to="'/account/reset/request'" class="alert-link" v-text="t$('login.password.forgot')"
 data-cy="forgetYourPasswordSelector" ></b-link>
<b-form-group v-bind:label="t$('login.form.password')" label-for="password">
  <b-form-input
    id="password"
    type="password"
    name="password"
    v-bind:placeholder="t$('login.form[\\'password.placeholder\\']')"
    v-model="password"
    data-cy="password"
  >
  </b-form-input>
</b-form-group>

<b-modal ref="removeUser" id="removeUser" v-bind:title="t$('entity.delete.title')" @ok="deleteUser()">
  <div class="modal-body">
    <p id="jhi-delete-user-heading" v-text="t$('userManagement.delete.question', { 'login': removeId})"></p>
  </div>
  <div slot="modal-footer">
    <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" v-on:click="closeDialog()"></button>
    <button type="button" class="btn btn-primary" id="confirm-delete-user" v-text="t$('entity.action.delete')" v-on:click="deleteUser()"></button>
  </div>
</b-modal>

<span v-bind:value="t$('sessions.title')"></span>
<label class="form-control-label" v-text="t$('entity.action.cancel')" for="entity.action.cancel"></label>
       <label class="form-control-label" v-text="t$('jhipsterVueApp.mapsIdGrandchildEntityWithoutDTO.date')" for="maps-id-grandchild-entity-without-dto-date"></label>

"
`);
      });
    });
  });
});
