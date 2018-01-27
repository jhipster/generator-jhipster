import * as React from 'react';
import { connect } from 'react-redux';
import { Input } from 'reactstrap';
import {
  Translate,
  ICrudGetAction,
  TextFormat,
  JhiPagination,
  getPaginationItemsNumber,
  getSortState,
  IPaginationState
} from 'react-jhipster';
import { FaSort } from 'react-icons/lib/fa';

import { getAudits } from '../../../reducers/administration';
import { APP_TIMESTAMP_FORMAT } from '../../../config/constants';
import { ITEMS_PER_PAGE } from '../../../shared/util/pagination.constants';

export interface IAuditsPageProps {
  isFetching?: boolean;
  audits: any[];
  getAudits: Function;
  totalItems: 0;
  history: any;
  location: any;
  onChangeFromDate: any;
  onChangeToDate: any;
}

export class AuditsPage extends React.Component<IAuditsPageProps, IPaginationState> {

  constructor(props) {
    super(props);
    this.state = {
      ...getSortState(props.location, ITEMS_PER_PAGE),
      fromDate: this.previousMonth(),
      toDate: this.today()
    };
  }

  componentDidMount() {
    this.getAudits();
  }

  onChangeFromDate = evt => {
    this.setState({
      fromDate: evt.target.value
    }, () => this.getAudits());
  }
  onChangeToDate = evt => {
    this.setState({
      toDate: evt.target.value
    }, () => this.getAudits());
  }

  previousMonth(): string {
    const now: Date = new Date();
    const fromDate = now.getMonth() === 0
      ? new Date(now.getFullYear() - 1, 11, now.getDate())
      : new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return fromDate.toISOString().slice(0, 10);
  }

  today(): string {
    // Today + 1 day - needed if the current day must be included
    const today: Date = new Date();
    today.setDate(today.getDate() + 1);
    const toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return toDate.toISOString().slice(0, 10);
  }

  sort = prop => () => {
    this.setState({
      order: this.state.order === 'asc' ? 'desc' : 'asc',
      sort: prop
    }, () => this.transition());
  }

  transition() {
    this.getAudits();
    this.props.history.push(`${this.props.location.pathname}?page=${this.state.activePage}&sort=${this.state.sort},${this.state.order}`);
  }

  handlePagination = activePage => this.setState({ activePage }, () => this.transition());

  getAudits = () => {
    const { activePage, itemsPerPage, sort, order, fromDate, toDate } = this.state;
    this.props.getAudits(activePage - 1, itemsPerPage, `${sort},${order}`, fromDate, toDate);
  }

  render() {
    const { audits, onChangeFromDate, onChangeToDate, totalItems } = this.props;
    const { fromDate, toDate } = this.state;
    return (
      <div>
        <h2>Audits</h2>
        <span><Translate contentKey="audits.filter.from">from</Translate></span>
        <Input type="date" value={fromDate} onChange={this.onChangeFromDate} name="fromDate" id="fromDate" />
        <span><Translate contentKey="audits.filter.to">to</Translate></span>
        <Input type="date" value={toDate} onChange={this.onChangeToDate} name="toDate" id="toDate" />
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th onClick={this.sort('auditEventDate')}><Translate contentKey="audits.table.header.date">Date</Translate><FaSort /></th>
                <th onClick={this.sort('principal')}><Translate contentKey="audits.table.header.principal">User</Translate><FaSort /></th>
                <th onClick={this.sort('auditEventType')}><Translate contentKey="audits.table.header.status">State</Translate><FaSort /></th>
                <th><Translate contentKey="audits.table.header.data">Extra data</Translate></th>
              </tr>
            </thead>
            <tbody>
              {audits.map((audit, i) => (
                <tr key={`audit-${i}`}>
                  <td>{<TextFormat value={audit.timestamp} type="date" format={APP_TIMESTAMP_FORMAT} />}</td>
                  <td>{audit.principal}</td>
                  <td>{audit.type}</td>
                  <td>
                    {audit.data ? audit.data.message : null}
                    {audit.data ? audit.data.remoteAddress : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row justify-content-center">
          <JhiPagination
            items={getPaginationItemsNumber(totalItems, this.state.itemsPerPage)}
            activePage={this.state.activePage}
            onSelect={this.handlePagination}
            maxButtons={5}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = storeState => ({
  audits: storeState.administration.audits,
  totalItems: storeState.administration.totalItems
});

const mapDispatchToProps = { getAudits };

export default connect(mapStateToProps, mapDispatchToProps)(AuditsPage);
