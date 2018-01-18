import * as React from 'react';
import { connect } from 'react-redux';
import { Alert, UncontrolledAlert } from 'reactstrap';
import { ICrudGetAction } from 'react-jhipster';

import { getNotifications } from './../../reducers/notification';

export interface IAlertComponentProps {
  getNotifications: ICrudGetAction;
  notifications: any[];
}

export interface IAlertComponentState {
  notifications: any[];
}

class AlertComponent extends React.Component<IAlertComponentProps, IAlertComponentState> {

  constructor(props) {
    super(props);
    this.state = {
      notifications: props.notifications
    };
  }

  componentDidMount() {
    this.props.getNotifications();
  }

  removeNotification = i => event => {
    this.state.notifications[i].visible = false;
    this.setState({ notifications: this.state.notifications });
    event.preventDefault();
  }

  render() {
    const { notifications } = this.state;
    return (
      <div>
        {
          notifications ?
          notifications.map((notification, i) => (
            <Alert color="success" key={`${i}`} isOpen={notification.visible} toggle={this.removeNotification(i)}>
              {notification.message}
            </Alert>
          ))
          : null
        }
      </div>
    );
  }
}

const mapStateToProps = storeState => ({
  notifications: storeState.notification.notifications
});

const mapDispatchToProps = { getNotifications };

export default connect(mapStateToProps, mapDispatchToProps)(AlertComponent);
