import React from 'react';
import { connect } from 'react-redux';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge, Table, Button } from 'reactstrap';

import { gatewayRoutes } from '../administration.reducer';

export interface IGatewayPageProps extends StateProps, DispatchProps {}

export class GatewayPage extends React.Component<IGatewayPageProps> {
  componentDidMount() {
    this.props.gatewayRoutes();
  }

  metadata = instance => {
    const spans = [];
    Object.keys(instance).map((key, index) => {
      spans.push(
        <span key={key.toString() + 'value'}>
          <Badge key={key.toString() + '-containerbadge'} className="font-weight-normal">
            <Badge key={key.toString() + '-badge'} color="info" className="font-weight-normal" pill>
              {key}
            </Badge>
            {instance[key]}
          </Badge>
        </span>
      );
    });
    return spans;
  };

  badgeInfo = info => {
    if (info) {
      if (info.status === 'UP') {
        return <Badge color="success">{info.status}</Badge>;
      } else {
        return <Badge color="danger">{info.status}</Badge>;
      }
    } else {
      return <Badge color="warning">?</Badge>;
    }
  };

  instanceInfo = route => {
    if (route) {
      return (
        <Table striped responsive>
          <tbody>
            {route.serviceInstances.map((instance, i) => (
              <tr key={instance.instanceInfo + '-info'}>
                <td>
                  <a href={instance.uri} target="_blank" rel="noopener noreferrer">
                    {instance.uri}
                  </a>
                </td>
                <td>{this.badgeInfo(instance.instanceInfo)}</td>
                <td>{this.metadata(instance.metadata)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      );
    }
  };

  gatewayRoutes = () => {
    if (!this.props.isFetching) {
      this.props.gatewayRoutes();
    }
  };

  render() {
    const { routes, isFetching } = this.props;
    return (
      <div>
        <h2>Gateway</h2>
        <p>
          <Button onClick={this.gatewayRoutes} color={isFetching ? 'danger' : 'primary'} disabled={isFetching}>
            <FontAwesomeIcon icon="sync" />
            &nbsp;
            <Translate component="span" contentKey="health.refresh.button">
              Refresh
            </Translate>
          </Button>
        </p>

        <Table striped responsive>
          <thead>
            <tr key="header">
              <th>
                <Translate contentKey="gateway.routes.url">URL</Translate>
              </th>
              <th>
                <Translate contentKey="gateway.routes.service">Service</Translate>
              </th>
              <th>
                <Translate contentKey="gateway.routes.servers">Available servers</Translate>
              </th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route, i) => (
              <tr key={`routes-${i}`}>
                <td>{route.path}</td>
                <td>{route.serviceId}</td>
                <td>{this.instanceInfo(route)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
}

const mapStateToProps = storeState => ({
  routes: storeState.administration.gateway.routes,
  account: storeState.authentication.account,
  isFetching: storeState.administration.loading,
});

const mapDispatchToProps = { gatewayRoutes };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(GatewayPage);
