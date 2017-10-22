/* eslint-disable */ // TODO Fix when page is completed
import * as React from 'react';
import { connect } from 'react-redux';
import { Translate } from 'react-jhipster';
import { Table, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import * as FaEye from 'react-icons/lib/fa/eye';
import * as FaRefresh from 'react-icons/lib/fa/refresh';
import HealthModal from './health-modal';
import { systemHealth } from '../../../reducers/administration';

export interface IHealthPageProps {
  isFetching?: boolean;
  systemHealth: Function;
  health: any;
  history: any;
  systemHealthInfo: any;
}

export class HealthPage extends React.Component<IHealthPageProps, any> {

  constructor(props) {
    super(props);
    this.state = {
      healthObject: {},
      showModal: false
    };
    this.handleClose = this.handleClose.bind(this);
  }

  getSystemHealthInfo(name, healthObject) {
    healthObject.name = name;
    this.setState({
      showModal: true,
      healthObject
    });
  }

  handleClose() {
    this.setState({
        showModal: false
    });
  }

  componentDidMount() {
    this.props.systemHealth();
  }

  getSystemHealth = () => {
    if (!this.props.isFetching) {
      this.props.systemHealth();
    }
  }

  renderModal = () => {
    const { healthObject } = this.state;
    return (
      <HealthModal healthObject={healthObject} handleClose={this.handleClose} showModal={this.state.showModal} />
    );
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
                  <tr key={configPropIndex}>
                    <td>{configPropKey}</td>
                    <td><button type="button" className={data[configPropKey].status !== 'UP' ? 'btn btn-danger' : 'btn btn-success'}>{data[configPropKey].status}</button></td>
                    <td><a onClick={() => this.getSystemHealthInfo(configPropKey, data[configPropKey])}><FaEye /></a></td>
                  </tr>
                : null
                )}
              </tbody>
             </Table>
            </div>
          </div>
          {this.renderModal()}
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
