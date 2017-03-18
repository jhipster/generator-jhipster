import React, { Component } from 'react';
import { connect } from 'react-redux';
import Translate from 'react-translate-component';

import { gatewayRoutes } from '../../reducers/administration';

export class GatewayPage extends Component {

  constructor(props) {
    super(props);
    this.getRoutes = this.getRoutes.bind(this);
  }

  componentDidMount() {
    this.props.gatewayRoutes();
  }

  getRoutes() {
    if (!this.props.isFetching) {
      this.props.gatewayRoutes();
    }
  }

  render() {
    const { gateway, isFetching } = this.props;
    const routes = gateway ? gateway.routes : [];
    return (
      <div className="well">
        <div>
          <h2 data-translate="gateway.title">Gateway</h2>

          <h3 data-translate="gateway.routes.title">Current routes</h3>
          <p>
            <button type="button" onClick={() => this.getRoutes()} className={isFetching ? 'btn btn-danger' : 'btn btn-primary'} disabled={isFetching}>
              <span className="glyphicon glyphicon-refresh glyphicon-" />&nbsp;
              <Translate component="span" content="gateway.refresh.button" />
            </button>
          </p>
          <table className="table table-striped table-responsive">
            <thead>
              <tr>
                <th><Translate content="gateway.routes.url" /></th>
                <th><Translate content="gateway.routes.service" /></th>
                <th><Translate content="gateway.routes.servers" /></th>
              </tr>
            </thead>

            <tbody>
              {
              routes.map((route, i) =>
                <tr key={`gateway-${i}`}>
                  <td>{route.path}</td>
                  <td>{route.serviceId}</td>
                  <td>
                    {
                      (route.serviceInstances && route.serviceInstances.length > 1) ?
                        (
                          <div className="label label-danger" aria-hidden="true"><Translate content="gateway.routes.error" /></div>
                        )
                        :
                        (
                          <table className="tabletable-responsive">
                            <tbody>
                              {route.serviceInstances.map((serviceInstance, j) =>
                                <tr key={`gateway-instance-${j}`}>
                                  <td>{serviceInstance.uri}</td>
                                  {
                                  serviceInstance.instanceInfo.status === 'UP' ?
                                    <td><div className="label label-success">{serviceInstance.instanceInfo.status}</div></td>
                                    : <td ng-hide="true" aria-hidden="true"><div className="label label-danger">UP</div></td>
                                }
                                </tr>
                            )}
                            </tbody>
                          </table>
                        )
                    }
                  </td>
                </tr>
              )
            }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default connect(
  ({ administration }) => ({ gateway: administration.gateway, isFetching: administration.isFetching }),
  { gatewayRoutes }
)(GatewayPage);
