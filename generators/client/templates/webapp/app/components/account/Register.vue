<template>
    <div>
        <div class="row justify-content-center">
            <div class="col-md-8">
                <h1 v-text="$t('register.title')">Registration</h1>

                <div class="alert alert-success" v-if="success" v-html="$t('register.messages.success')">
                    <strong>Registration saved!</strong> Please check your email for confirmation.
                </div>

                <div class="alert alert-danger" v-if="error" v-html="$t('register.messages.error.fail')">
                    <strong>Registration failed!</strong> Please try again later.
                </div>

                <div class="alert alert-danger" v-if="errorUserExists" v-html="$t('register.messages.error.userexists')">
                    <strong>Login name already registered!</strong> Please choose another one.
                </div>

                <div class="alert alert-danger" v-if="errorEmailExists" v-html="$t('register.messages.error.emailexists')">
                    <strong>Email is already in use!</strong> Please choose another one.
                </div>

                <div class="alert alert-danger" v-if="doNotMatch" v-text="$t('global.messages.error.dontmatch')">
                    The password and its confirmation do not match!
                </div>
            </div>
        </div>
        <div class="row justify-content-center">
            <div class="col-md-8">
                <form name="registerForm" role="form" v-on:submit.prevent="register()" v-if="!success" no-validate>
                    <div class="form-group">
                        <label class="form-control-label" for="login" v-text="$t('global.form.username')">Username</label>
                        <input type="text" class="form-control" v-model="$v.registerAccount.login.$model" id="login" name="login"
                               :class="{'valid': !$v.registerAccount.login.$invalid, 'invalid': $v.registerAccount.login.$invalid }"
                               required minlength="1" maxlength="50" pattern="^[_.@A-Za-z0-9-]*$" v-bind:placeholder="$t('global.form[\'username.placeholder\']')">
                        <div v-if="$v.registerAccount.login.$anyDirty && $v.registerAccount.login.$invalid">
                            <small class="form-text text-danger" v-if="!$v.registerAccount.login.required"
                                   v-text="$t('register.messages.validate.login.required')">
                                Your username is required.
                            </small>
                            <small class="form-text text-danger" v-if="!$v.registerAccount.login.minLength"
                                   v-text="$t('register.messages.validate.login.minlength')">
                                Your username is required to be at least 1 character.
                            </small>
                            <small class="form-text text-danger" v-if="!$v.registerAccount.login.maxLength"
                                   v-text="$t('register.messages.validate.login.maxlength')">
                                Your username cannot be longer than 50 characters.
                            </small>
                            <small class="form-text text-danger" v-if="!$v.registerAccount.login.pattern"
                                   v-text="$t('register.messages.validate.login.pattern')">
                                Your username can only contain letters and digits.
                            </small>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-control-label" for="email" v-text="$t('global.form.email')">Email</label>
                        <input type="email" class="form-control" id="email" name="email"
                               :class="{'valid': !$v.registerAccount.email.$invalid, 'invalid': $v.registerAccount.email.$invalid }"
                               v-model="$v.registerAccount.email.$model" minlength=5 maxlength=254 email required  v-bind:placeholder="$t('global.form[\'email.placeholder\']')">
                        <div v-if="$v.registerAccount.email.$anyDirty && $v.registerAccount.email.$invalid">
                            <small class="form-text text-danger" v-if="!$v.registerAccount.email.required"
                                   v-text="$t('global.messages.validate.email.required')">
                                Your email is required.
                            </small>
                            <small class="form-text text-danger" v-if="!$v.registerAccount.email.email"
                                   v-text="$t('global.messages.validate.email.invalid')">
                                Your email is invalid.
                            </small>
                            <small class="form-text text-danger" v-if="!$v.registerAccount.email.minLength"
                                   v-text="$t('global.messages.validate.email.minlength')">
                                Your email is required to be at least 5 characters.
                            </small>
                            <small class="form-text text-danger" v-if="!$v.registerAccount.email.maxLength"
                                   v-text="$t('global.messages.validate.email.maxlength')">
                                Your email cannot be longer than 100 characters.
                            </small>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-control-label" for="password" v-text="$t('global.form.newpassword')">New password</label>
                        <input type="password" class="form-control" id="password" name="password"
                               :class="{'valid': !$v.registerAccount.password.$invalid, 'invalid': $v.registerAccount.password.$invalid }"
                               v-model="$v.registerAccount.password.$model" minlength=4 maxlength=50 required v-bind:placeholder="$t('global.form[\'newpassword.placeholder\']')">
                        <div v-if="$v.registerAccount.password.$anyDirty && $v.registerAccount.password.$invalid">
                            <small class="form-text text-danger" v-if="!$v.registerAccount.password.required"
                                   v-text="$t('global.messages.validate.newpassword.required')">
                                Your password is required.
                            </small>
                            <small class="form-text text-danger" v-if="!$v.registerAccount.password.minLength"
                                   v-text="$t('global.messages.validate.newpassword.minlength')">
                                Your password is required to be at least 4 characters.
                            </small>
                            <small class="form-text text-danger" v-if="!$v.registerAccount.password.maxLength"
                                   v-text="$t('global.messages.validate.newpassword.maxlength')">
                                Your password cannot be longer than 50 characters.
                            </small>
                        </div>
                        <!--<jhi-password-strength-bar [passwordToCheck]="registerAccount.password"></jhi-password-strength-bar>-->
                    </div>
                    <div class="form-group">
                        <label class="form-control-label" for="confirmPassword" v-text="$t('global.form.confirmpassword')">New password confirmation</label>
                        <input type="password" class="form-control" id="confirmPassword" name="confirmPasswordInput"
                               :class="{'valid': !$v.confirmPassword.$invalid, 'invalid': $v.confirmPassword.$invalid }"
                               v-model="$v.confirmPassword.$model" minlength=4 maxlength=50 required v-bind:placeholder="$t('global.form[\'confirmpassword.placeholder\']')">
                        <div v-if="$v.confirmPassword.$dirty && $v.confirmPassword.$invalid">
                            <small class="form-text text-danger" v-if="!$v.confirmPassword.required"
                                   v-text="$t('global.messages.validate.confirmpassword.required')">
                                Your confirmation password is required.
                            </small>
                            <small class="form-text text-danger" v-if="!$v.confirmPassword.minLength"
                                   v-text="$t('global.messages.validate.confirmpassword.minlength')">
                                Your confirmation password is required to be at least 4 characters.
                            </small>
                            <small class="form-text text-danger" v-if="!$v.confirmPassword.maxLength"
                                   v-text="$t('global.messages.validate.confirmpassword.maxlength')">
                                Your confirmation password cannot be longer than 50 characters.
                            </small>
                        </div>
                    </div>

                    <button type="submit" :disabled="$v.registerAccount.$invalid || $v.confirmPassword.$invalid" class="btn btn-primary" v-text="$t('register.form.button')">Register</button>
                </form>
                <p></p>
                <div class="alert alert-warning">
                    <span v-text="$t('global.messages.info.authenticated.prefix')">If you want to </span>
                    <a class="alert-link" v-on:click="openLogin()" v-text="$t('global.messages.info.authenticated.link')">sign in</a><span v-html="$t('global.messages.info.authenticated.suffix')">, you can try the default accounts:<br/>- Administrator (login="admin" and password="admin") <br/>- User (login="user" and password="user").</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import RegisterService from './RegisterService'
    import LoginModalService from './LoginModalService'
    import { required, minLength, maxLength, helpers, email } from 'vuelidate/lib/validators'
    import {EMAIL_ALREADY_USED_TYPE, LOGIN_ALREADY_USED_TYPE} from "../../constants";

    const loginPattern = helpers.regex('alpha', /^[_.@A-Za-z0-9-]*$/);

    export default {
        name: 'Register',
        mixins: [RegisterService, LoginModalService],
        data () {
            return {
                confirmPassword: undefined,
                doNotMatch: undefined,
                error: undefined,
                errorEmailExists: undefined,
                errorUserExists: undefined,
                registerAccount: {
                    login: undefined,
                    email: undefined,
                    password: undefined
                },
                success: false
            }
        },
        validations: {
            registerAccount: {
                login: {
                    required,
                    minLength: minLength(1),
                    maxLength: maxLength(50),
                    pattern: loginPattern
                },
                email: {
                    required,
                    minLength: minLength(5),
                    maxLength: maxLength(254),
                    email
                },
                password: {
                    required,
                    minLength: minLength(4),
                    maxLength: maxLength(254),
                }
            },
            confirmPassword: {
                required,
                minLength: minLength(4),
                maxLength: maxLength(254),
            }
        },
        methods: {
            register: function () {
                if (this.registerAccount.password !== this.confirmPassword) {
                    this.doNotMatch = 'ERROR';
                } else {
                    this.doNotMatch = null;
                    this.error = null;
                    this.errorUserExists = null;
                    this.errorEmailExists = null;
                    //this.languageService.getCurrent().then(key => {
                        this.registerAccount.langKey = 'FR';
                        this.processRegistration(this.registerAccount).then(response => {
                            this.success = true;
                        })
                        .catch(error  => {
                            this.success = null;
                            if (error.response.status === 400 && error.response.data.type === LOGIN_ALREADY_USED_TYPE) {
                                this.errorUserExists = 'ERROR';
                            } else if (error.response.status === 400 && error.response.data.type === EMAIL_ALREADY_USED_TYPE) {
                                this.errorEmailExists = 'ERROR';
                            } else {
                                this.error = 'ERROR';
                            }
                        });
                    //});
                }
            }
        }
    }
</script>

<style scoped>

</style>
