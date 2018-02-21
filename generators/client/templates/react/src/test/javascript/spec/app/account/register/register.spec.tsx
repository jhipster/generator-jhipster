// import * as React from 'react';
// import * as Enzyme from 'enzyme';
// import * as EnzymeAdapter from 'enzyme-adapter-react-16';
// import axios from 'axios';
// import { expect } from 'chai';
// import configureStore from 'redux-mock-store';
// import { spy, sandbox } from 'sinon';

// import RegisterPage from '../../../../../../main/webapp/app/modules/account/register/register';

/*
describe('RegisterComponent', () => {
  describe('RegisterPage', () => {
    Enzyme.configure({ adapter: new EnzymeAdapter() });
    let mountedWrapper;
    let localSandbox;
    const mockStore = configureStore();

    const wrapper = () => {
      localSandbox = sandbox.create();
      const localeSpy = spy();
      const initialState = {};
      const store = mockStore(initialState);

      if (!mountedWrapper) {
        mountedWrapper = Enzyme.shallow(
          <RegisterPage store={store} onLocaleChange={localeSpy}/>
        );
      }

      return mountedWrapper;
    };

    const defaultInput = {
      username: 'testUsername',
      email: 'test@email.com',
      firstPassword: 'pa$$word',
      secondPassword: 'pa$$word'
    };

    const fillForm = (wrappedRegister, values = defaultInput) => {
      const dive = wrappedRegister.dive();

      dive.find({ name: 'username' }).simulate('change', { target: { value: values.username } });
      dive.find({ name: 'email' }).simulate('change', { target: { value: values.email } });
      dive.find({ name: 'firstPassword' }).simulate('change', { target: { value: values.firstPassword } });
      dive.find({ name: 'secondPassword' }).simulate('change', { target: { value: values.secondPassword } });
    };

    beforeEach(() => {
      mountedWrapper = undefined;
    });

    it('should ensure the two passwords entered match', async () => {
      const register = wrapper();
      const values = {
        ...defaultInput,
        secondPassword: 'otherpassword'
      };

      fillForm(register, values);
      register.dive().find('#register-submit').simulate('click');

      // Both should be false since you can't submit an invalid form.
      expect(register.props().registrationSuccess).to.be.equals(false);
      expect(register.props().registrationFailure).to.be.equals(false);
    });

    it('should update registration success to true after creating an account', async () => {
      const register = wrapper();
      fillForm(register);
      const resolved = new Promise(r => r({ status: 201 }));
      localSandbox.stub(axios, 'get').returns(resolved);

      register.dive().find('#register-submit').simulate('click');

      expect(register.props().registrationSuccess).to.be.equals(true);
      expect(register.props().registrationFailure).to.be.equals(false);
    });

    it('should notify of user existence upon 400/login already in use', () => {
      const register = wrapper();
      fillForm(register);
      const resolved = new Promise(r => r({ status: 400, data: {
          'entityName' : 'userManagement',
          'errorKey' : 'userexists',
          'type' : 'http://www.jhipster.tech/problem/login-already-used',
          'title' : 'Login already in use',
          'status' : 400,
          'message' : 'error.userexists',
          'params' : 'userManagement'
        }
      }));
      localSandbox.stub(axios, 'get').returns(resolved);

      register.dive().find('#register-submit').simulate('click');

      expect(register.props().registrationSuccess).to.be.equals(false);
      expect(register.props().registrationFailure).to.be.equals(true);
      expect(register.props().errorMessage).to.be.equals('userexists');
    });

    it('should notify of email existence upon 400/email address already in use', () => {
      const register = wrapper();
      fillForm(register);
      const resolved = new Promise(r => r({ status: 400, data: {
          'entityName' : 'userManagement',
          'errorKey' : 'emailexists',
          'type' : 'http://www.jhipster.tech/problem/email-already-used',
          'title' : 'Email address already in use',
          'status' : 400,
          'message' : 'error.emailexists',
          'params' : 'userManagement'
        }
      }));
      localSandbox.stub(axios, 'get').returns(resolved);

      register.dive().find('#register-submit').simulate('click');

      expect(register.props().registrationSuccess).to.be.equals(false);
      expect(register.props().registrationFailure).to.be.equals(true);
      expect(register.props().errorMessage).to.be.equals('emailexists');
    });

    it('should notify of generic error', () => {
      // Add a sandbox to simulate a generic error.
      const register = wrapper();
      fillForm(register);
      const resolved = new Promise(r => r({ status: 503 }));
      sandbox.stub(axios, 'get').returns(resolved);

      register.dive().find('#register-submit').simulate('click');

      expect(register.props().registrationSuccess).to.be.equals(false);
      expect(register.props().registrationFailure).to.be.equals(true);
      expect(register.props().errorMessage).to.be.equals(undefined);
    });

  });
});
*/
