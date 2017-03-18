import React, { Component } from 'react';
import Translate from 'react-translate-component';
// import { Link } from 'react-router';

export default class Footer extends Component {
  render() {
    return (
      <div className="footer container">
        <div className="row">
          <p className="col-md-12"><Translate content="global.footer.text">My footer</Translate></p>
        </div>
      </div>
    );
  }
}
