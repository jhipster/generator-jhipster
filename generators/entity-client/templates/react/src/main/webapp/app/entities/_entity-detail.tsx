<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FaArrowLeft } from 'react-icons/lib/fa';
import Time from 'react-time';

import { ICrudGetAction } from '../../shared/model/redux-action.type';
import { getEntity } from './<%= entityFileName %>.reducer';
import { APP_DATE_FORMAT } from '../../config/constants';

export interface I<%= entityReactName %>DetailProps {
  getEntity: ICrudGetAction;
  <%= entityInstance %>: any;
  match: any;
}

export class <%= entityReactName %>Detail extends React.Component<I<%= entityReactName %>DetailProps, undefined> {

  componentDidMount() {
    this.props.getEntity(this.props.match.params.id);
  }

  render() {
    const { <%= entityInstance %> } = this.props;
    return (
      <div>
        detail
      </div>
    );
  }
}

const mapStateToProps = storeState => ({
    <%= entityInstancePlural %>: storeState.<%= entityInstance %>.entity
});

const mapDispatchToProps = { getEntity };

export default connect(mapStateToProps, mapDispatchToProps)(<%= entityReactName %>Detail);
