import * as React from 'react';
import { connect } from 'react-redux';
import { Translate, ICrudGetAction } from 'react-jhipster';
import { FaRefresh } from 'react-icons/lib/fa';

import { gatewayRoutes } from '../../../reducers/administration';

export interface IGatewayPageProps {
  gatewayRoutes: ICrudGetAction;
  routes: any[];
  account: any;
  isFetching?: boolean;
}

export class GatewayPage extends React.Component<IGatewayPageProps> {

  componentDidMount() {
    this.props.gatewayRoutes();
  }

  metadata = instance => {
    const spans = [];
    Object.keys(instance).map((key, index) => {
      spans.push((
        <span key={key.toString() + 'value'}>
          <span key={key.toString() + '-containerbadge'} className="badge badge-default font-weight-normal">
            <span key={key.toString() + '-badge'} className="badge badge-pill badge-info font-weight-normal">{key}</span>
            {instance[key]}
          </span>
        </span>
      ));
    });
    return spans;
  }

  badgeInfo = info => {
    if (info) {
      if (info.status === 'UP') {
        return <div className="badge badge-success">{info.status}</div>;
      } else {
        return <div className="badge badge-danger">{info.status}</div>;
      }
    } else {
      return <div className="badge badge-warning">?</div>;
    }
  }

  instanceInfo = route => {
    if (route) {
      return (
        <div className="table-responsive">
          <table className="table table-striped">
            <tbody>
              {route.serviceInstances.map((instance, i) =>
                <tr key={instance.instanceInfo + '-info'}>
                  <td><a href={instance.uri} target="_blank">{instance.uri}</a></td>
                  <td>{this.badgeInfo(instance.instanceInfo)}</td>
                  <td>{this.metadata(instance.metadata)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>);
    }
  }

  gatewayRoutes = () => {
    if (!this.props.isFetching) {
      this.props.gatewayRoutes();
    }
  }

  render() {
    const { routes, isFetching } = this.props;
    return (
      <div>
        <h2>Gateway</h2>
          <p>
            <button type="button" onClick={this.gatewayRoutes} className={isFetching ? 'btn btn-danger' : 'btn btn-primary'} disabled={isFetching}>
              <FaRefresh />&nbsp;
              <Translate component="span" contentKey="health.refresh.button" />
            </button>
          </p>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr key="header">
                  <th><Translate contentKey="gateway.routes.url"/></th>
                  <th><Translate contentKey="gateway.routes.service"/></th>
                  <th><Translate contentKey="gateway.routes.servers"/></th>
                </tr>
              </thead>
              <tbody>
              {routes.map((route, i) =>
                <tr key={`routes-${i}`}>
                  <td>{route.path}</td>
                  <td>{route.serviceId}</td>
                  <td>{this.instanceInfo(route)}</td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
    );
  }
}

const mapStateToProps = storeState => ({
  routes: storeState.administration.gateway.routes,
  account: storeState.authentication.account
});

const mapDispatchToProps = { gatewayRoutes };

export default connect(mapStateToProps, mapDispatchToProps)(GatewayPage);
