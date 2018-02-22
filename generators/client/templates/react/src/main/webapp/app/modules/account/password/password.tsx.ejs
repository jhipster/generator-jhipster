/* eslint-disable */ // TODO Fix when page is completed
import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';

import { getSession } from '../../../reducers/authentication';
import { savePassword } from '../../../reducers/account';

export interface IUserSettingsProps {
  account: any;
  getSession: Function;
}

export interface IUserSettingsState {
  account: any;
  firstPassword: string;
  secondPassword: string;
}

export class SettingsPage extends React.Component<IUserSettingsProps, IUserSettingsState> {
  constructor(props) {
    super(props);
    this.state = {
      account: props.account,
      firstPassword: null,
      secondPassword: null
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

  setFirstAccountPassword = event => {
    this.setState({
      firstPassword: event.target.value
    });
  }

  setSecondAccountPassword = event => {
    this.setState({
      secondPassword: event.target.value
    });
  }

  savePassword = event => {
    if (this.state.firstPassword === this.state.secondPassword) {
      savePassword(this.state.firstPassword);
    }
    event.preventDefault();
  }

  render() {
    const { account } = this.state;
    return (
        <div>
          <h2>Password for [{account.login}]</h2>
          <Form>
            <FormGroup>
              <Label>New password</Label>
              <Input type="password" className="form-control" id="firstName" name="firstName" placeholder="New password"
                     onChange={this.setFirstAccountPassword} />
            </FormGroup>
            <FormGroup>
              <Label>New password confirmation</Label>
              <Input type="password" className="form-control" id="lastName" name="lastName" placeholder="Confirm the new password" onChange={this.setSecondAccountPassword}/>
            </FormGroup>
             <Button type="submit" color="success" onClick={this.savePassword}>Save</Button>
          </Form>
        </div>
    );
  }
}

const mapStateToProps = storeState => ({
  account: storeState.authentication.account,
  isAuthenticated: storeState.authentication.isAuthenticated
});

const mapDispatchToProps = { getSession, savePassword };

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
