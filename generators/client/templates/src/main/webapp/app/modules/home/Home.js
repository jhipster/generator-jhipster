import React, { Component } from 'react';
import { Link } from 'react-router';
import Translate from 'react-translate-component';
import { connect } from 'react-redux';
import { TextField, RaisedButton, Checkbox, Popover, Subheader, Avatar, FontIcon } from 'material-ui';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { List, ListItem } from 'material-ui/List';

import { log } from '../../shared/util/log-util';
import { getSession } from '../../reducers/authentication';

import './home.scss';

export class Home extends Component {
  static propTypes = {
    account: React.PropTypes.object.isRequired,
    getSession: React.PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      currentUser: props.account
    };
  }

  componentWillMount() {
    this.props.getSession();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      currentUser: nextProps.account
    });
  }

  render() {
    const { currentUser } = this.state;

    return (
      <div className="">
        <div className="row">
          <div className="col-md-12">
            <h2><Translate content="home.welcome">Welcome to jhi</Translate></h2>
            <div>
              {
                (currentUser && currentUser.login) ? (
                  <div>
                    <div className="alert alert-success">
                      <Translate content="home.logged-success">You are logged in as</Translate> &quot;{ currentUser.login }&quot;
                    </div>
                    <form onSubmit={this.searchForJenkinsJobNames}>
                      <div className="row middle-xs">
                        <div className="col-xs-10" />
                        <div className="col-xs-2" />
                      </div>
                    </form>
                    <div className="row" />
                  </div>
                ) : (
                  <div>
                    <div className="alert alert-warning">
                      If you want to <Link to="/login" className="alert-link">sign in</Link>, you can try the default accounts:
                      <br />- Administrator (login=&quot;admin&quot; and password=&quot;admin&quot;)
                      <br />- User (login=&quot;user&quot; and password=&quot;user&quot;).
                    </div>
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  store => ({
    account: store.authentication.account,
    isAuthenticated: store.authentication.isAuthenticated
  }),
  { getSession }
)(Home);
