import * as React from 'react';
import { Translate } from 'react-jhipster';

import './footer.scss';

import appConfig from '../../../config/constants';

const Footer = props => (
  <div className="footer page-content">
    <div className="row">
      <p className="col-md-12"><Translate contentKey="footer">Your footer</Translate></p>
    </div>
  </div>
);

export default Footer;
