<template>
    <div>
        <div class="row justify-content-center">
            <div class="col-md-8 toastify-container">
                <h2 v-if="account" id="password-title"><span v-html="$t('password.title', { 'username': username})">Password for [<b>{{username}}</b>]</span></h2>

                <div class="alert alert-success" role="alert" v-if="success" v-html="$t('password.messages.success')">
                    <strong>Password changed!</strong>
                </div>
                <div class="alert alert-danger" role="alert" v-if="error"  v-html="$t('password.messages.error')">
                    <strong>An error has occurred!</strong> The password could not be changed.
                </div>

                <div class="alert alert-danger" role="alert" v-if="doNotMatch" v-text="$t('global.messages.error.dontmatch')">
                    The password and its confirmation do not match!
                </div>

                <form name="form" role="form" id="password-form" v-on:submit.prevent="changePassword()">

                    <div class="form-group">
                        <label class="form-control-label" for="currentPassword" v-text="$t('global.form[\'currentpassword.label\']')">Current password</label>
                        <input type="password" class="form-control" id="currentPassword" name="currentPassword"
                               :class="{'valid': !$v.resetPassword.currentPassword.$invalid, 'invalid': $v.resetPassword.currentPassword.$invalid }"
                               v-bind:placeholder="$t('global.form[\'currentpassword.placeholder\']')"
                               v-model="$v.resetPassword.currentPassword.$model" required>
                        <div v-if="$v.resetPassword.currentPassword.$anyDirty && $v.resetPassword.currentPassword.$invalid">
                            <small class="form-text text-danger"
                                   v-if="!$v.resetPassword.currentPassword.required" v-text="$t('global.messages.validate.newpassword.required')">
                                Your password is required.
                            </small>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-control-label" for="newPassword" v-text="$t('global.form[\'newpassword.label\']')">New password</label>
                        <input type="password" class="form-control" id="newPassword" name="newPassword"
                               v-bind:placeholder="$t('global.form[\'newpassword.placeholder\']')"
                               :class="{'valid': !$v.resetPassword.newPassword.$invalid, 'invalid': $v.resetPassword.newPassword.$invalid }"
                               v-model="$v.resetPassword.newPassword.$model" minlength=4 maxlength=50 required>
                        <div v-if="$v.resetPassword.newPassword.$anyDirty && $v.resetPassword.newPassword.$invalid">
                            <small class="form-text text-danger"
                                   v-if="!$v.resetPassword.newPassword.required" v-text="$t('global.messages.validate.newpassword.required')">
                                Your password is required.
                            </small>
                            <small class="form-text text-danger"
                                   v-if="!$v.resetPassword.newPassword.minLength" v-text="$t('global.messages.validate.newpassword.minlength')">
                                Your password is required to be at least 4 characters.
                            </small>
                            <small class="form-text text-danger"
                                   v-if="!$v.resetPassword.newPassword.maxLength" v-text="$t('global.messages.validate.newpassword.maxlength')">
                                Your password cannot be longer than 50 characters.
                            </small>
                        </div>
                        <!--<jhi-password-strength-bar [passwordToCheck]="newPassword"></jhi-password-strength-bar>-->
                    </div>
                    <div class="form-group">
                        <label class="form-control-label" for="confirmPassword" v-text="$t('global.form[\'confirmpassword.label\']')">New password confirmation</label>
                        <input type="password" class="form-control" id="confirmPassword" name="confirmPassword"
                               :class="{'valid': !$v.resetPassword.confirmPassword.$invalid, 'invalid': $v.resetPassword.confirmPassword.$invalid }"
                               v-bind:placeholder="$t('global.form[\'confirmpassword.placeholder\']')"
                               v-model="$v.resetPassword.confirmPassword.$model" minlength=4 maxlength=50 required>
                        <div v-if="$v.resetPassword.confirmPassword.$anyDirty && $v.resetPassword.confirmPassword.$invalid">
                            <small class="form-text text-danger"
                                   v-if="!$v.resetPassword.confirmPassword.required" v-text="$t('global.messages.validate.confirmpassword.required')">
                                Your confirmation password is required.
                            </small>
                            <small class="form-text text-danger"
                                   v-if="!$v.resetPassword.confirmPassword.minLength" v-text="$t('global.messages.validate.confirmpassword.minlength')">
                                Your confirmation password is required to be at least 4 characters.
                            </small>
                            <small class="form-text text-danger"
                                   v-if="!$v.resetPassword.confirmPassword.maxLength" v-text="$t('global.messages.validate.confirmpassword.maxlength')">
                                Your confirmation password cannot be longer than 50 characters.
                            </small>
                        </div>
                    </div>

                    <button type="submit" :disabled="$v.resetPassword.$invalid" class="btn btn-primary" v-text="$t('password.form.button')">Save</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./change-password.component.ts">
</script>
