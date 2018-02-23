import * as React from 'react';
import { Button, Form, FormGroup, Label, Input, Col, Alert, Row } from 'reactstrap';
import { connect } from 'react-redux';
import { Translate, translate } from 'react-jhipster';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { getSession } from '../../../reducers/authentication';
import { saveAccountSettings } from '../../../reducers/account';
<%_ if (enableTranslation) { _%>
  import { locales } from '../../../config/translation';
<%_ } _%>

const successAlert = (
  <Alert color="success" >
    <strong><Translate contentKey="settings.messages.success" /></strong>
  </Alert>
);

export interface IUserSettingsProps {
  account: any;
  getSession: Function;
  saveAccountSettings: Function;
  updateSuccess: boolean;
}

export interface IUserSettingsState {
  account: any;
}

export class SettingsPage extends React.Component<IUserSettingsProps, IUserSettingsState> {
  constructor(props) {
    super(props);
    this.state = {
      account: props.account
    };
  }

  componentDidMount() {
    this.props.getSession();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      account: nextProps.account
    });
  }
  <%_ if (enableTranslation) { _%>
  setLangKey = event => {
    this.setState({
      account: {
        ...this.state.account,
        langKey: event.target.value
      }
    });
  };
  <%_ } _%>
  handleValidSubmit = (event, values) => {
    const account = {
      ...this.state.account,
      ...values<%_ if (enableTranslation) { _%>,
      langKey: this.state.account.langKey
      <%_ } _%>
    };

    this.props.saveAccountSettings(account);
    event.persist();
  };

  render() {
    const { account } = this.state;
    const { updateSuccess } = this.props;

    return (
      <div>
        <Row className="justify-content-center">
          <Col md="8" >
            {/* TODO: use translation on this title */}
            <h2>User settings for [{account.login}]</h2>
            { (updateSuccess) ? successAlert : null }
            <AvForm onValidSubmit={this.handleValidSubmit}>
              {/* First name */}
              <AvField
                className="form-control"
                name="firstName"
                label={<Translate contentKey="settings.form.firstname" />}
                id="firstName"
                placeholder={translate('settings.form.firstname.placeholder')}
                validate={{
                  required: { value: true, errorMessage: translate('settings.messages.validate.firstname.required') },
                  minLength: { value: 1, errorMessage: translate('settings.messages.validate.firstname.minlength') },
                  maxLength: { value: 50, errorMessage: translate('settings.messages.validate.firstname.maxlength') }
                }}
                value={account.firstName}
              />
              {/* Last name */}
              <AvField
                className="form-control"
                name="lastName"
                label={<Translate contentKey="settings.form.lastname" />}
                id="lastName"
                placeholder={translate('settings.form.lastname.placeholder')}
                validate={{
                  required: { value: true, errorMessage: translate('settings.messages.validate.lastname.required') },
                  minLength: { value: 1, errorMessage: translate('settings.messages.validate.lastname.minlength') },
                  maxLength: { value: 50, errorMessage: translate('settings.messages.validate.lastname.maxlength') }
                }}
                value={account.lastName}
              />
              {/* Email */}
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
                value={account.email}
              />
              <%_ if (enableTranslation) { _%>
              {/* Language key */}
              <AvField
                type="select"
                id="langKey"
                name="langKey"
                className="form-control"
                label={translate('settings.form.language')}
                onChange={this.setLangKey}
                defaultValue={account.langKey}
              >
                {/* TODO: Add findLanguageFromKey translation to options */}
                {locales.map(lang => (
                  <option value={lang} key={lang}>
                    {lang}
                  </option>
                ))}
              </AvField>
              <%_ } _%>
              <Button color="primary" type="submit">
                <Translate contentKey="settings.form.button" />
              </Button>
            </AvForm>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = ({ authentication, account }) => ({
  account: authentication.account,
  isAuthenticated: authentication.isAuthenticated,
  updateSuccess: account.updateSuccess,
  updateFailure: account.updateFailure
});

const mapDispatchToProps = { getSession, saveAccountSettings };

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
