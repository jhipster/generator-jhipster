import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FaPlus, FaEye, FaPencil, FaTrash } from 'react-icons/lib/fa';

export default class <%= entityAngularName %> extends React.Component<undefined, undefined> {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h2>
          <%= entityAngularName %>
          <Link to={``} className="btn btn-primary float-right jh-create-entity">
            <FaPlus /> Create
          </Link>
        </h2>
        <div className="table-responsive">
          TODO: table
        </div>
      </div>
    );
  }
}
