import * as React from 'react';
import * as Translate from 'react-translate-component';
import {
  Navbar,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import { Link } from 'react-router';
import LoadingBar from 'react-redux-loading-bar';

import { locales } from '../../../config/translation';
import IconButton from '../../ui-components/icon-button/icon-button';
import appConfig from '../../../config/constants';
import './header.scss';

export interface IHeaderProps {
  currentLocale: string;
  onLocaleChange: Function;
}

const Header = ({ currentLocale, onLocaleChange }: IHeaderProps) => {
  <%_ if (enableTranslation) { _%>
  const handleChange = (event, index, language) => {
    onLocaleChange(language);
  };
  <%_ } _%>

  const renderDevRibbon = () => (
    process.env.NODE_ENV === 'development' ?
      <div className="ribbon dev"><a href=""><Translate content="global.ribbon.dev" /></a></div> :
      null
  );

  return (
    <div>
      {renderDevRibbon()}
      <Navbar className="pad-5">
        <div className="navbar-brand">
          <Link to="/" className="brand-logo">
            <span className="brand-title"><Translate with={appConfig} content="global.title">JHipster</Translate></span>
            <span className="navbar-version">{appConfig.version}</span>
          </Link>
        </div>
        {locales.length > 1 ?
          <Dropdown toggle={handleChange}>
            <DropdownToggle caret>
              {currentLocale}
            </DropdownToggle>
            <DropdownMenu>
              {locales.map(lang => <DropdownItem key={lang} value={lang}>{lang.toUpperCase()}</DropdownItem>)}
            </DropdownMenu>
          </Dropdown> : null
        }
      </Navbar>
      <LoadingBar />
    </div>
  );
};

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
//   <%_ if (enableTranslation) { _%>
//   handleChange = (event, index, language) => {
//     this.props.onLocaleChange(language);
//   };
//   <%_ } _%>

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
//             <%_ if (applicationType === 'gateway') { _%>
//             <Link to="/admin/gateway">
//               <ListItem
//                 key={4.1} innerDivStyle={menuListStyle}
//                 primaryText={<Translate content="global.menu.admin.gateway" />}
//                 leftIcon={<ActionHome />}
//               />
//             </Link>
//             <%_ } _%>
//             <Link to="/admin/user-management">
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
//             <%_ if (websocket == 'spring-websocket') { _%>
//               // TODO
//             <%_ } _%>
//             <Link to="/admin/configuration">
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
//             </Link><% if (devDatabaseType === 'h2Disk' || devDatabaseType === 'h2Memory') { %>,
//             <a href="/h2-console">
//               <ListItem
//                 key={4.9} innerDivStyle={menuListStyle}
//                 leftIcon={<AvLibraryBooks />}
//                 primaryText={<Translate content="global.menu.admin.database" />}
//               />
//             </a>
//             <%_ } _%>
//           ]}
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
//                 <span className="brand-title"><Translate content="global.title"><%= capitalizedBaseName %></Translate></span>
//                 <span className="navbar-version">{appConfig.version}</span>
//               </Link>
//             </div>
//           }
//           onLeftIconButtonTouchTap={this.toggleSideBar}
//           <%_ if (enableTranslation) { _%>
//           iconElementRight={
//             <DropDownMenu value={currentLocale} onChange={this.handleChange} underlineStyle={{ borderTop: 'none' }} labelStyle={{ color: HEADER_COLOR }}>
//               {locales.map(lang => <MenuItem key={lang} value={lang} primaryText={lang.toUpperCase()} />)}
//             </DropDownMenu>
//           }
//           <%_ } _%>
//         />
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
//                 <%_ if (authenticationType == 'session') { _%>
//                   // TODO
//                 <%_ } _%>
//                 menuItemAccountPassword,
//                 menuItemAccountSignOut
//               ]}
//             />
//           </List>
//         </Drawer>
//       </div>
//     );
//   }
// }
