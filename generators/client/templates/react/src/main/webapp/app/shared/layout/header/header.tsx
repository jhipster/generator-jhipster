import './header.scss';

import * as React from 'react';
import * as Translate from 'react-translate-component';
import {
  Navbar, NavDropdown,
  Nav, NavItem, NavLink, NavbarToggler, NavbarBrand, Collapse, UncontrolledNavDropdown,
  DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import { NavLink as Link } from 'react-router-dom';
import LoadingBar from 'react-redux-loading-bar';

import { locales } from '../../../config/translation';
import appConfig from '../../../config/constants';

const devEnv = process.env.NODE_ENV === 'development';

export interface IHeaderProps {
  currentLocale: string;
  onLocaleChange: Function;
}

const BrandIcon = props => (
  <div {...props} className="brand-icon">
    <img
      src="static/images/logo-jhipster-react.svg"
      alt="Logo"
    />
  </div>
);
export class Header extends React.Component<IHeaderProps, { menuOpen: boolean }> {

  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false
    };
  }

  <%_ if (enableTranslation) { _%>
  handleChange = (event, index, language) => {
    this.props.onLocaleChange(language);
  }

  <%_ } _%>
  renderDevRibbon = () => (
    process.env.NODE_ENV === 'development' ?
      <div className="ribbon dev"><a href=""><Translate content="global.ribbon.dev" /></a></div> :
      null
  )

  toggleMenu = () => {
    this.setState({ menuOpen: !this.state.menuOpen });
  }

  render() {
    return (
      <div id="app-header">
        {this.renderDevRibbon()}
        <LoadingBar className="loading-bar"/>
        <Navbar inverse toggleable fixed="top" className="jh-navbar">
          <NavbarToggler right onClick={this.toggleMenu} />
          <NavbarBrand tag={Link} to="/" className="brand-logo">
            <BrandIcon />
            <span className="brand-title"><Translate with={appConfig} content="global.title">AppName</Translate></span>
            <span className="navbar-version">{appConfig.version}</span>
          </NavbarBrand>
          <Collapse isOpen={this.state.menuOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink tag={Link} to="/">
                  {/* <i className="fa fa-home" aria-hidden="true"/> */}
                  <span>Home</span>
                </NavLink>
              </NavItem>
              <UncontrolledNavDropdown>
                <DropdownToggle nav caret>
                  Entities
                </DropdownToggle>
                <DropdownMenu right>
                  {/* Nothing yet  */}
                </DropdownMenu>
              </UncontrolledNavDropdown>
              {devEnv ?
                <UncontrolledNavDropdown>
                  <DropdownToggle nav caret>
                    Administration
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem tag={Link} to="/admin/health">Health</DropdownItem>
                    <DropdownItem tag={Link} to="/admin/metrics">Metrics</DropdownItem>
                    <DropdownItem tag={Link} to="/admin/configuration">Configuration</DropdownItem>
                    <DropdownItem tag={Link} to="/admin/docs">API Docs</DropdownItem>
                  </DropdownMenu>
                </UncontrolledNavDropdown> : null
              }
              <UncontrolledNavDropdown>
                <DropdownToggle nav caret>
                  Account
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag={Link} to="/account/settings">Settings</DropdownItem>
                  <DropdownItem tag={Link} to="/account/password">Password</DropdownItem>
                  <DropdownItem tag={Link} to="/logout">Logout</DropdownItem>
                  <DropdownItem tag={Link} to="/login">Login</DropdownItem>
                </DropdownMenu>
              </UncontrolledNavDropdown>
            <%_ if (enableTranslation) { _%>
              { locales.length > 1 ?
                <NavDropdown toggle={this.handleChange}>
                  <DropdownToggle caret>
                    {this.props.currentLocale}
                  </DropdownToggle>
                  <DropdownMenu right>
                    {locales.map(lang => <DropdownItem key={lang} value={lang}>{lang.toUpperCase()}</DropdownItem>)}
                  </DropdownMenu>
                </NavDropdown> : null
              }
            <%_ } _%>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}

export default Header;
// import React, { Component, PropTypes } from 'react';
// import Translate from 'react-translate-component';

// import { Link } from 'react-router';

// import { locales } from '../../../config/translation';
// import appConfig from '../../../config/constants';

// import './header.scss';

// export default class Header extends Component {
//   static propTypes = {
//     isAuthenticated: PropTypes.bool.isRequired,
//     currentLocale: PropTypes.string.isRequired,
//     handleLogout: PropTypes.func.isRequired,
//     onLocaleChange: PropTypes.func.isRequired
//   };

//   constructor(props) {
//     super(props);
//     this.state = {
//       sidebarOpen: false
//     };
//   }
////   handleChange = (event, index, language) => {
//     this.props.onLocaleChange(language);
//   };
//
//   toggleSideBar = () => {
//     this.setState({
//       sidebarOpen: !this.state.sidebarOpen
//     });
//   }

//   render() {
//     const { currentLocale, isAuthenticated, handleLogout } = this.props;
//     const menuListStyle = { marginLeft: 18 };

//     let menuItemAccountLogin = (
//       <Link to="/login">
//         <ListItem
//           key={2.1} innerDivStyle={menuListStyle}
//           primaryText={<Translate content="global.menu.account.login" />}
//           leftIcon={<ActionLock />}
//         />
//       </Link>
//     );
//     let menuItemAccountRegister = (
//       <Link to="/register">
//         <ListItem
//           key={2.2} innerDivStyle={menuListStyle}
//           primaryText={<Translate content="global.menu.account.register" />}
//           leftIcon={<ActionNoteAdd />}
//         />
//       </Link>
//     );

//     let menuItemEntities = null;

//     let menuItemAccountSettings = null;
//     let menuItemAccountPassword = null;
//     let menuItemAccountSignOut = null;
//     let menuItemAdministration = null;

//     if (isAuthenticated) {
//       menuItemEntities = (
//         <ListItem
//           primaryText={<Translate content="global.menu.entities.main" />}
//           leftIcon={<ActionList />}
//           initiallyOpen={false}
//           primaryTogglesNestedList
//           nestedItems={[
//           ]}
//         />
//       );

//       menuItemAccountLogin = null;
//       menuItemAccountRegister = null;
//       menuItemAccountSettings = (
//         <Link to="/account/settings">
//           <ListItem
//             key={2.3} innerDivStyle={menuListStyle}
//             primaryText={<Translate content="global.menu.account.settings" />}
//             leftIcon={<ActionSettings />}
//           />
//         </Link>
//       );
//       menuItemAccountPassword = (
//         <Link to="/account/password">
//           <ListItem
//             key={2.4} innerDivStyle={menuListStyle}
//             primaryText={<Translate content="global.menu.account.password" />}
//             leftIcon={<CommunicationVpnKey />}
//           />
//         </Link>
//       );
//       menuItemAccountSignOut = (
//         <ListItem
//           key={2.5} onClick={() => handleLogout()} innerDivStyle={menuListStyle}
//           primaryText={<Translate content="global.menu.account.logout" />}
//           leftIcon={<ActionExitToApp />}
//         />
//       );

//       menuItemAdministration = (
//         <ListItem
//           key={4}
//           primaryText={<Translate content="global.menu.admin.main" />}
//           leftIcon={<SocialPersonAdd />}
//           initiallyOpen={false}
//           primaryTogglesNestedList
//           nestedItems={[
////             <Link to="/admin/user-management">
//               <ListItem
//                 key={4.2} innerDivStyle={menuListStyle}
//                 leftIcon={<SocialGroup />}
//                 primaryText={<Translate content="global.menu.admin.userManagement" />}
//               />
//             </Link>,
//             <Link to="/admin/metrics">
//               <ListItem
//                 key={4.3} innerDivStyle={menuListStyle}
//                 leftIcon={<ActionAssessment />}
//                 primaryText={<Translate content="global.menu.admin.metrics" />}
//               />
//             </Link>,
//             <Link to="/admin/health">
//               <ListItem
//                 key={4.4} innerDivStyle={menuListStyle}
//                 leftIcon={<ActionFavorite />}
//                 primaryText={<Translate content="global.menu.admin.health" />}
//               />
//             </Link>,
////             <Link to="/admin/configuration">
//               <ListItem
//                 key={4.5} innerDivStyle={menuListStyle}
//                 leftIcon={<ActionBuild />}
//                 primaryText={<Translate content="global.menu.admin.configuration" />}
//               />
//             </Link>,
//             <Link to="/admin/audits">
//               <ListItem
//                 key={4.6} innerDivStyle={menuListStyle}
//                 leftIcon={<AlertAddAlert />}
//                 primaryText={<Translate content="global.menu.admin.audits" />}
//               />
//             </Link>,
//             <Link to="/admin/logs">
//               <ListItem
//                 key={4.7} innerDivStyle={menuListStyle}
//                 leftIcon={<ActionAssignment />}
//                 primaryText={<Translate content="global.menu.admin.logs" />}
//               />
//             </Link>,
//             <Link to="/admin/docs">
//               <ListItem
//                 key={4.8} innerDivStyle={menuListStyle}
//                 leftIcon={<AvLibraryBooks />}
//                 primaryText={<Translate content="global.menu.admin.apidocs" />}
//               />
//             </Link>,
//             <a href="/h2-console">
//               <ListItem
//                 key={4.9} innerDivStyle={menuListStyle}
//                 leftIcon={<AvLibraryBooks />}
//                 primaryText={<Translate content="global.menu.admin.database" />}
//               />
//             </a>
////           ]}
//         />
//       );
//     }

//     return (
//       <div>
//         <div className="ribbon dev"><a href=""><Translate content="global.ribbon.dev" /></a></div>
//         <AppBar
//           title={
//             <div>
//               <Link to="/" className="brand-logo">
//                 <span className="brand-title"><Translate content="global.title">Jhipster</Translate></span>
//                 <span className="navbar-version">{appConfig.version}</span>
//               </Link>
//             </div>
//           }
//           onLeftIconButtonTouchTap={this.toggleSideBar}
////           iconElementRight={
//             <DropDownMenu value={currentLocale} onChange={this.handleChange} underlineStyle={{ borderTop: 'none' }} labelStyle={{ color: HEADER_COLOR }}>
//               {locales.map(lang => <MenuItem key={lang} value={lang} primaryText={lang.toUpperCase()} />)}
//             </DropDownMenu>
//           }
////         />
//         <Drawer open={this.state.sidebarOpen} docked={false} onRequestChange={sidebarOpen => this.setState({ sidebarOpen })}>
//           <List>
//             <Subheader>Application Menu</Subheader>
//             <Link to="/"><ListItem primaryText={<Translate content="global.menu.home" />} leftIcon={<ActionHome />} /></Link>
//             {menuItemEntities}
//             {menuItemAdministration}
//             <ListItem
//               primaryText={<Translate content="global.menu.account.main" />}
//               leftIcon={<ActionLock />}
//               initiallyOpen={false}
//               primaryTogglesNestedList key={2}
//               nestedItems={[
//                 menuItemAccountLogin,
//                 menuItemAccountRegister,
//                 menuItemAccountSettings,
////                 menuItemAccountPassword,
//                 menuItemAccountSignOut
//               ]}
//             />
//           </List>
//         </Drawer>
//       </div>
//     );
//   }
// }
