import * as React from 'react';
import { Translate, translate } from 'react-jhipster';
import { connect } from 'react-redux';

import { AvForm, AvField } from 'availity-reactstrap-validation';
import { Row, Col, Alert, Button } from 'reactstrap';

import { register, reset } from '../../../reducers/register';

export const mainErrorMessages = {
  failed: (
    <Translate contentKey="register.messages.error.fail">
      <strong>Registration failed!</strong> Please try again later.
    </Translate>
  ),
  userexists: (
    <Translate contentKey="register.messages.error.userexists">
      <strong>Login name already registered!</strong> Please choose another one.
    </Translate>
  ),
  emailexists: (
    <Translate contentKey="register.messages.error.emailexists">
      <strong>Email is already in use!</strong> Please choose another one.
    </Translate>
  )
};

export interface IRegisterProps {
  register: Function;
  reset: Function;
  registrationSuccess: boolean;
  registrationFailure: boolean;
  errorMessage: string;
}

export class RegisterPage extends React.Component<IRegisterProps, {}> {
  constructor(props) {
    super(props);
    this.handleValidSubmit = this.handleValidSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.reset();
  }

  handleValidSubmit = (event, values) => {
    this.props.register(values.username, values.email, values.firstPassword);
    event.preventDefault();
  };

  render() {
    const { registrationSuccess, registrationFailure, errorMessage } = this.props;
    let alertMessage = null;

    if (registrationFailure) {
      alertMessage = (
        <Alert color="danger">
          {mainErrorMessages[errorMessage] === undefined ? mainErrorMessages.failed : mainErrorMessages[errorMessage]}
        </Alert>
      );
    } else {
      if (registrationSuccess) {
        alertMessage = (
          <Alert color="success">
            <Translate contentKey="register.messages.success">
              <strong>Registration saved!</strong> Please check your email for confirmation.
            </Translate>
          </Alert>
        );
      } else {
        alertMessage = null;
      }
    }

    return (
      <div>
        <Row className="justify-content-center">
          <Col md="8">
            <h1>
              <Translate contentKey="register.title">Registration</Translate>
            </h1>
            {alertMessage}
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md="8">
            <AvForm id="register-form" onValidSubmit={this.handleValidSubmit}>
              <AvField
                name="username"
                label={<Translate contentKey="global.form.username" />}
                placeholder={translate('global.form.username.placeholder')}
                validate={{
                  required: { value: true, errorMessage: translate('register.messages.validate.login.required') },
                  pattern: { value: '^[_.@A-Za-z0-9-]*$', errorMessage: translate('register.messages.validate.login.pattern') },
                  minLength: { value: 1, errorMessage: translate('register.messages.validate.login.minlength') },
                  maxLength: { value: 50, errorMessage: translate('register.messages.validate.login.maxlength') }
                }}
              />
              <AvField
                name="email"
                label={<Translate contentKey="global.form.email" />}
                placeholder={translate('global.form.email.placeholder')}
                type="email"
                validate={{
                  required: { value: true, errorMessage: translate('global.messages.validate.email.required') },
                  minLength: { value: 5, errorMessage: translate('global.messages.validate.email.minlength') },
                  maxLength: { value: 254, errorMessage: translate('global.messages.validate.email.maxlength') }
                }}
              />
              <AvField
                name="firstPassword"
                label={<Translate contentKey="global.form.newpassword" />}
                placeholder={translate('global.form.newpassword.placeholder')}
                type="password"
                validate={{
                  required: { value: true, errorMessage: translate('global.messages.validate.newpassword.required') },
                  minLength: { value: 4, errorMessage: translate('global.messages.validate.newpassword.minlength') },
                  maxLength: { value: 50, errorMessage: translate('global.messages.validate.newpassword.maxlength') }
                }}
              />
              <AvField
                name="secondPassword"
                label={<Translate contentKey="global.form.confirmpassword" />}
                placeholder={translate('global.form.confirmpassword.placeholder')}
                type="password"
                validate={{
                  required: { value: true, errorMessage: translate('global.messages.validate.confirmpassword.required') },
                  minLength: { value: 4, errorMessage: translate('global.messages.validate.confirmpassword.minlength') },
                  maxLength: { value: 50, errorMessage: translate('global.messages.validate.confirmpassword.maxlength') },
                  match: { value: 'firstPassword', errorMessage: translate('global.messages.error.dontmatch') }
                }}
              />
              <Button id="register-submit" color="primary" type="submit">
                <Translate contentKey="register.form.button" />
              </Button>
            </AvForm>
            <p>&nbsp;</p>
            <Alert color="warning">
              <span>
                <Translate contentKey="global.messages.info.authenticated.prefix">If you want to </Translate>
              </span>
              <a className="alert-link">
                <Translate contentKey="global.messages.info.authenticated.link">sign in</Translate>
              </a>
              <span>
                <Translate contentKey="global.messages.info.authenticated.suffix">
                  , you can try the default accounts:<br />- Administrator (login="admin" and password="admin") <br />- User (login="user"
                  and password="user").
                </Translate>
              </span>
            </Alert>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = storeState => ({
  registrationSuccess: storeState.register.registrationSuccess,
  registrationFailure: storeState.register.registrationFailure,
  errorMessage: storeState.register.errorMessage
});

const mapDispatchToProps = { register, reset };

export default connect(mapStateToProps, mapDispatchToProps)(RegisterPage);
