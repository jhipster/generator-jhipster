import React, { Component } from 'react';
import Translate from 'react-translate-component';

export default class Footer extends Component {
  render() {
    return (
      <div className="footer container">
        <div className="row">
          <p className="col-md-12"><Translate content="footer">My footer</Translate></p>
        </div>
      </div>
    );
  }
}
