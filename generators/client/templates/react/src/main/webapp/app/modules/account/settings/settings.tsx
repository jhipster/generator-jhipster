/* eslint-disable */ // TODO Fix when page is completed
import * as React from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { connect } from 'react-redux';
<%_ if (enableTranslation) { _%>
import { locales } from '../../../config/translation';
<%_ } _%>

import { getSession } from '../../../reducers/authentication';
import { saveAccountSettings } from '../../../reducers/account';

export interface IUserSettingsProps {
  account: any;
  getSession: Function;
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

  setFirstName = event => {
    this.setState({
      account: {
        ...this.state.account,
        firstName: event.target.value
      }
    });
  }

  setLastName = event => {
    this.setState({
      account: {
        ...this.state.account,
        lastName: event.target.value
      }
    });
  }

  setEmail = event => {
    this.setState({
      account: {
        ...this.state.account,
        email: event.target.value
      }
    });
  }

  saveSettings = event => {
    saveAccountSettings(this.state.account);
    event.preventDefault();
  }

  render() {
    const { account } = this.state;
    return (
        <div>
          <h2>User settings for [{account.login}]</h2>
          <Form>
            {/* TODO: change to Availity form components */}
            <FormGroup>
              <Label for="firstName">First Name</Label>
              <Input type="text" className="form-control" value={account.firstName} id="firstName" name="firstName" placeholder="First Name"
              onChange={this.setFirstName}/>
            </FormGroup>
            <FormGroup>
              <Label for="lastName">Last Name</Label>
              <Input type="text" className="form-control" value={account.lastName} id="lastName" name="lastName" placeholder="Last Name"
              onChange={this.setLastName}/>
            </FormGroup>
            <FormGroup>
              <Label for="email">Email</Label>
              <Input type="text" className="form-control" value={account.email} id="email" name="email" placeholder="Email"
              onChange={this.setEmail}/>
            </FormGroup>
            <%_ if (enableTranslation) { _%>
            <FormGroup>
              <Label for="langKey">Language</Label>
              <Input type="select" id="langKey" name="langKey" className="form-control">
                {locales.map(lang => <option value={lang} key={lang}>{lang}</option>)}
              </Input>
            </FormGroup>
            <%_ } _%>
            <Button type="submit" color="success" onClick={this.saveSettings}>Save</Button>
          </Form>
      </div>
    );
  }
}

const mapStateToProps = storeState => ({
  account: storeState.authentication.account,
  isAuthenticated: storeState.authentication.isAuthenticated
});

const mapDispatchToProps = { getSession, saveAccountSettings };

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
