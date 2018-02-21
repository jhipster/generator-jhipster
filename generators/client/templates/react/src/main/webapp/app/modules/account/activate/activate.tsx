import * as React from 'react';
import { connect } from 'react-redux';

import { Row, Col, Alert, Button } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { parse } from 'query-string';

import { activateAction, reset } from '../../../reducers/activate';

const successAlert = (
  <Alert color="success">
    <Translate contentKey="activate.messages.success" />
    <a className="alert-link">
      <Translate contentKey="global.messages.info.authenticated.link" />
    </a>.
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
}

export class ActivatePage extends React.Component<IActivateProps> {

  componentWillMount() {
    const location = this.props['location'];
    if (location && location['search']) {
      const getParameters = parse(location.search);
      this.props.activateAction(getParameters.key);
    }
  }

  componentWillUnmount() {
    this.props.reset();
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
            {(activationSuccess) ? successAlert : undefined}
            {(activationFailure) ? failureAlert : undefined}
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
