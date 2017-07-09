import React, { Component } from 'react';
import Translate from 'react-translate-component';

export class DocsPage extends Component {

  render() {
    return (
      <div>
        <iframe
          src="../swagger-ui/index.html" width="100%" height="800"
          target="_top" title="Swagger UI" seamless style={{ border: 'none' }}
        />
      </div>
    );
  }
}

export default DocsPage;
