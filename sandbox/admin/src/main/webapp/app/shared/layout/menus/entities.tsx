import React from 'react';
import MenuItem from 'app/shared/layout/menus/menu-item';
import { Translate, translate } from 'react-jhipster';
import { NavDropdown } from './menu-components';

export const EntitiesMenu = props => (
  <NavDropdown
    icon="th-list"
    name={translate('global.menu.entities.main')}
    id="entity-menu"
    data-cy="entity"
    style={{ maxHeight: '80vh', overflow: 'auto' }}
  >
    <MenuItem icon="asterisk" to="/search-label">
      <Translate contentKey="global.menu.entities.recorderSearchLabel" />
    </MenuItem>
    <MenuItem icon="asterisk" to="/user-group">
      <Translate contentKey="global.menu.entities.recorderUserGroup" />
    </MenuItem>
    <MenuItem icon="asterisk" to="/machine-label">
      <Translate contentKey="global.menu.entities.recorderMachineLabel" />
    </MenuItem>
    <MenuItem icon="asterisk" to="/channel">
      <Translate contentKey="global.menu.entities.recorderChannel" />
    </MenuItem>
    <MenuItem icon="asterisk" to="/node">
      <Translate contentKey="global.menu.entities.recorderNode" />
    </MenuItem>
    <MenuItem icon="asterisk" to="/record">
      <Translate contentKey="global.menu.entities.recorderRecord" />
    </MenuItem>
    <MenuItem icon="asterisk" to="/category-label">
      <Translate contentKey="global.menu.entities.recorderCategoryLabel" />
    </MenuItem>
    <MenuItem icon="asterisk" to="/user-profile">
      <Translate contentKey="global.menu.entities.recorderUserProfile" />
    </MenuItem>
    {/* jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here */}
  </NavDropdown>
);
