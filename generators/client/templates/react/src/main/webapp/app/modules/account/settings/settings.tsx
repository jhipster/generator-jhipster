/* eslint-disable */ // TODO Fix when page is completed
import * as React from 'react';
import { connect } from 'react-redux';
import { locales } from '../../../config/translation';

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
      <div className="well">
        <div>
          <h2>User settings for [{account.login}]</h2>
        </div>
        <form>
          <div className="form-group">
            <label className="control-label" >First Name</label>
            <input type="text" className="form-control" value={account.firstName} id="firstName" name="firstName" placeholder="First Name"
            onChange={this.setFirstName}/>
            <label className="control-label" >Last Name</label>
            <input type="text" className="form-control" value={account.lastName} id="lastName" name="lastName" placeholder="Last Name"
            onChange={this.setLastName}/>
            <label className="control-label" >Email</label>
            <input type="text" className="form-control" value={account.email} id="email" name="email" placeholder="Email"
                   onChange={this.setEmail}/>
            <label>Language</label>
            <select id="langKey" name="langKey" className="form-control">
              {locales.map(lang => <option value="lang" key="lang">{lang}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" onClick={this.saveSettings} >Save</button>
        </form>
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
