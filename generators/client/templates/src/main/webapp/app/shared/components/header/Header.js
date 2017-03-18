import React, { Component, PropTypes } from 'react';
import Translate from 'react-translate-component';
import AppBar from 'material-ui/AppBar';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import { Link } from 'react-router';

import { locales } from '../../../config/translation';
import appConfig from '../../../config/app';
import { HEADER_COLOR } from '../../util/global-style';

import './header.scss';

export default class Header extends Component {
  static propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    currentLocale: PropTypes.string.isRequired,
    handleLogout: PropTypes.func.isRequired,
    toggleSideBar: PropTypes.func.isRequired,
    onLocaleChange: PropTypes.func.isRequired
  };

  handleChange = (event, index, language) => {
    this.props.onLocaleChange(language);
  };

  render() {
    const { currentLocale, toggleSideBar } = this.props;

    return (
      <div>
        <div className="ribbon dev"><a href=""><Translate content="global.ribbon.dev" /></a></div>
        <AppBar
          title={
            <div>
              <Link to="/" className="brand-logo">
                <span className="brand-title"><Translate content="global.title">jhi</Translate></span>
                <span className="navbar-version">{appConfig.version}</span>
              </Link>
            </div>
          }
          onLeftIconButtonTouchTap={toggleSideBar}
          iconElementRight={
            <DropDownMenu value={currentLocale} onChange={this.handleChange} underlineStyle={{ borderTop: 'none' }} labelStyle={{ color: HEADER_COLOR }}>
              {locales.map(lang => <MenuItem key={lang} value={lang} primaryText={lang.toUpperCase()} />)}
            </DropDownMenu>
          }
        />
        {/* <Nav pullRight>
          //   <LinkContainer to="/">
          //     <NavItem eventKey={1} href="#"><span><span className="glyphicon glyphicon-home"></span>&nbsp;<Translate component="span" content="global.menu.home" /></span></NavItem>
          //   </LinkContainer>
          //   {menuItemEntities}
          //   <NavDropdown eventKey={2}
          //                title={<span><span className="glyphicon glyphicon-user"></span>&nbsp;<Translate component="span" content="global.menu.account.main" /></span>}
          //                id="basic-nav-dropdown">
          //     {menuItemAccountLogin}
          //     {menuItemAccountRegister}
          //     {menuItemAccountSettings}
          //     {menuItemAccountPassword}
          //     {menuItemAccountSignOut}
          //   </NavDropdown>
          //   {menuItemAdministration}
          // </Nav> */}
      </div>
    );
  }
}
