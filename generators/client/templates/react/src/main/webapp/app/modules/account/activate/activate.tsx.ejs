import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Col, Alert } from 'reactstrap';
import { Translate } from 'react-jhipster';

import { activateAction, reset } from './activate.reducer';

const successAlert = (
  <Alert color="success">
    <Translate contentKey="activate.messages.success" />
    <Link to="/login" className="alert-link">
      <Translate contentKey="global.messages.info.authenticated.link" />
    </Link>.
  </Alert>
);

const failureAlert = (
  <Alert color="danger">
    <Translate contentKey="activate.messages.error" />
  </Alert>
);

export interface IActivateProps {
  activateAction: Function;
  reset: Function;
  activationSuccess: boolean;
  activationFailure: boolean;
  match: any;
}

export class ActivatePage extends React.Component<IActivateProps> {
  componentWillUnmount() {
    this.props.reset();
  }

  componentDidMount() {
    const { key } = this.props.match.params;
    this.props.activateAction(key);
  }

  render() {
    const { activationSuccess, activationFailure } = this.props;

    return (
      <div>
        <Row className="justify-content-center">
          <Col md="8">
            <h1>
              <Translate contentKey="activate.title" />
            </h1>
            {activationSuccess ? successAlert : undefined}
            {activationFailure ? failureAlert : undefined}
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = ({ activate }) => ({
  activationSuccess: activate.activationSuccess,
  activationFailure: activate.activationFailure
});

const mapDispatchToProps = { activateAction, reset };

export default connect(mapStateToProps, mapDispatchToProps)(ActivatePage);
