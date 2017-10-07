import * as React from 'react';
import { connect } from 'react-redux';
import { Translate } from 'react-jhipster';
import { Table } from 'reactstrap';
import { FaEye, FaRefresh } from 'react-icons/lib/fa';

import { systemHealth } from '../../../reducers/administration';

export interface IHealthPageProps {
  isFetching?: boolean;
  systemHealth: Function;
  health: any;
}

export class HealthPage extends React.Component<IHealthPageProps, undefined> {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.systemHealth();
  }

  getSystemHealth = () => {
    if (!this.props.isFetching) {
      this.props.systemHealth();
    }
  }

  render() {
    const { health, isFetching } = this.props;
    const data = health || {};
    return (
      <div>
          <h2>Health Checks</h2>
          <p>
            <button type="button" onClick={this.getSystemHealth} className={isFetching ? 'btn btn-danger' : 'btn btn-primary'} disabled={isFetching}>
              <FaRefresh />&nbsp;
              <Translate component="span" contentKey="health.refresh.button" />
            </button>
          </p>
          <div className="row">
            <div className="col-12">
            <Table bordered>
               <thead>
                 <tr>
                   <th>Service Name</th>
                   <th>Status</th>
                   <th>Details</th>
                 </tr>
               </thead>
               <tbody>
                 {Object.keys(data).map((configPropKey, configPropIndex) =>
                   (configPropKey !== 'status') ?
                     (<tr key={configPropIndex}>
                       <td>{configPropKey}</td>
                       <td>
                        <button type="button" className={data[configPropKey].status !== 'UP' ? 'btn btn-danger' : 'btn btn-success'}>
                        {data[configPropKey].status}
                        </button>
                       </td>
                       <td>
                          <FaEye />
                       </td>
                     </tr>)
                     : ''
                 )}
               </tbody>
             </Table>
            </div>
          </div>
        </div>
    );
  }
}

const mapStateToProps = storeState => ({
  health: storeState.administration.health,
  isFetching: storeState.administration.isFetching
});

const mapDispatchToProps = { systemHealth };

export default connect(mapStateToProps, mapDispatchToProps)(HealthPage);

