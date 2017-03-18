import React, { Component } from 'react';
import Translate from 'react-translate-component';

export class ApiDocsPage extends Component {

  render() {
    return (
      <div>
        <h2><Translate content="health.title">API Documentation</Translate></h2>
        <iframe
          src="../swagger-ui/index.html" width="100%" height="800"
          target="_top" title="Swagger UI" seamless style={{ border: 'none' }}
        />
      </div>
    );
  }
}

export default ApiDocsPage;
