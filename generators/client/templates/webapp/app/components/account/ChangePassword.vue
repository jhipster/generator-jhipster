<template>
    <div>
        <div class="row justify-content-center">
            <div class="col-md-8">
                <h2 v-if="account"><span v-bind:html="$t('password.title')">Password for [<b>{{username}}</b>]</span></h2>

                <div class="alert alert-success" v-if="success" v-html="$t('password.messages.success')">
                    <strong>Password changed!</strong>
                </div>
                <div class="alert alert-danger" v-if="error"  v-html="$t('password.messages.error')">
                    <strong>An error has occurred!</strong> The password could not be changed.
                </div>

                <div class="alert alert-danger" v-if="doNotMatch" v-text="$t('global.messages.error.dontmatch')">
                    The password and its confirmation do not match!
                </div>

                <form name="form" role="form" v-on:submit.prevent="changePassword()">

                    <div class="form-group">
                        <label class="form-control-label" for="currentPassword" v-text="$t('global.form.currentpassword')">Current password</label>
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
                        <label class="form-control-label" for="newPassword" v-text="$t('global.form.newpassword')">New password</label>
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
                        <label class="form-control-label" for="confirmPassword" v-text="$t('global.form.confirmpassword')">New password confirmation</label>
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
<script>
    import {maxLength, minLength, required} from 'vuelidate/lib/validators'
    import axios from 'axios'
    import Principal from './Principal';
    import {mapGetters} from 'vuex'


    export default {
        mixins: [Principal],
        data() {
            return {
                success: null,
                error: null,
                doNotMatch: null,
                resetPassword: {
                    currentPassword: null,
                    newPassword: null,
                    confirmPassword: null,
                }
            }
        },
        validations: {
            resetPassword: {
                currentPassword: {
                    required
                },
                newPassword: {
                    required,
                    minLength: minLength(4),
                    maxLength: maxLength(254)
                },
                confirmPassword: {
                    required,
                    minLength: minLength(4),
                    maxLength: maxLength(254)
                }
            }
        },
        methods: {
            changePassword: function() {
                if (this.resetPassword.newPassword !== this.resetPassword.confirmPassword) {
                    this.error = null;
                    this.success = null;
                    this.doNotMatch = 'ERROR';
                } else {
                    this.doNotMatch = null;
                    let vm = this;
                    axios.post('api/account/change-password', {
                        currentPassword: this.resetPassword.currentPassword,
                        newPassword: this.resetPassword.newPassword
                    }).then(() => {
                        vm.success = 'OK';
                        vm.error = null;
                    }).catch(() => {
                        vm.success = null;
                        vm.error = 'ERROR';
                    });
                }
            }
        },
        computed: {
            ...mapGetters([
                'account'
            ])
        }
    }
</script>
