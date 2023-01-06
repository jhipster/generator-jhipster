/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { jestExpect as expect } from 'mocha-expect-snapshot';
import jest from 'jest-mock';

import { createTranslationReplacer } from './transform-react.mjs';

describe('generator - react - transform', () => {
  describe('replaceReactTranslations', () => {
    let replaceReactTranslations;
    beforeEach(() => {
      let value = 0;
      replaceReactTranslations = createTranslationReplacer(
        jest.fn().mockImplementation((key, interpolation = '') => {
          if (interpolation) {
            interpolation = `-${JSON.stringify(interpolation)}`;
          }
          return `${key}${interpolation}-translated-value-${value++}`;
        })
      );
    });

    describe('with translation disabled', () => {
      describe('.tsx files', () => {
        const extension = '.tsx';

        it('should replace Translate tag', () => {
          const body = `
<Translate contentKey="home.subtitle">This is your homepage</Translate>
`;
          expect(replaceReactTranslations(body, extension)).toMatchInlineSnapshot(`
"
home.subtitle-translated-value-0
"
`);
        });

        it('should replace multine Translate tag with contentKey comming first', () => {
          const body = `
<Translate contentKey="sessions.title" interpolate={{ username: account.login }}>
Active sessions for [<strong>{account.login}</strong>]
</Translate>
`;
          expect(replaceReactTranslations(body, extension)).toMatchInlineSnapshot(`
"
sessions.title-{&quot;username&quot;:&quot;{account.login}&quot;}-translated-value-0
"
`);
        });

        it('should replace multine Translate tag with interpolate comming first', () => {
          const body = `
<Translate interpolate={{ username: account.login }} contentKey="sessions.title">
Active sessions for [<strong>{account.login}</strong>]
</Translate>
`;
          expect(replaceReactTranslations(body, extension)).toMatchInlineSnapshot(`
"
sessions.title-{&quot;username&quot;:&quot;{account.login}&quot;}-translated-value-0
"
`);
        });

        it('should replace translate function', () => {
          const body = `
translate('global')
`;
          expect(replaceReactTranslations(body, extension)).toMatchInlineSnapshot(`
"
"global-translated-value-0"
"
`);
        });

        it('should replace translate function with interpolation', () => {
          const body = `
translate('global', { min:20, max: 50, pattern: '^[a-zA-Z0-9]*$',
  anotherPattern: "^[a-zA-Z0-9]*$",
  dynamic: exec(),
})
`;
          expect(replaceReactTranslations(body, extension)).toMatchInlineSnapshot(`
"
"global-{"min":20,"max":50,"pattern":"^[a-zA-Z0-9]*","anotherPattern":"^[a-zA-Z0-9]*","dynamic":"{exec()}"}-translated-value-0"
"
`);
        });

        it('should replace wrapped translate function with interpolation', () => {
          const body = `
{translate('global', { min:20, max: 50, pattern: '^[a-zA-Z0-9]*$',
  anotherPattern: "^[a-zA-Z0-9]*$",
  dynamic: exec(),
})}
`;
          expect(replaceReactTranslations(body, extension)).toMatchInlineSnapshot(`
"
"global-{"min":20,"max":50,"pattern":"^[a-zA-Z0-9]*","anotherPattern":"^[a-zA-Z0-9]*","dynamic":"{exec()}"}-translated-value-0"
"
`);
        });

        it('should translate tsx file', () => {
          const body = `
import React from 'react';
import { Link } from 'react-router-dom';
import { Translate } from 'react-jhipster';
import { Row, Col, Alert } from 'reactstrap';

import { useAppSelector } from 'app/config/store';

export const Home = () => {
  const account = useAppSelector(state => state.authentication.account);

  return (
    <Row>
      <Col md="3" className="pad">
        <span className="hipster rounded" />
      </Col>
      <Col md="9">
        <h2><Translate contentKey="home.title">Welcome,  Hipster!</Translate></h2>
        <p className="lead">
        <Translate contentKey="home.subtitle"> This is your homepage </Translate>
         </p>
        {
          (account?.login) ? (
            <div>
              <Alert color="success">
                <Translate contentKey="home.logged.message" interpolate={{ username: account.login }}>You are logged in as user {account.login}.</Translate>
              </Alert>
            </div>
          ) : (
            <div>
              <Alert color="warning">
                <Translate contentKey="global.messages.info.authenticated.prefix">If you want to </Translate>
                <% if (!enableTranslation) { %><span>&nbsp;</span><% } %>
                <Link to="/login" className="alert-link"><Translate contentKey="global.messages.info.authenticated.link"> sign in</Translate></Link>
                <Translate contentKey="global.messages.info.authenticated.suffix">, you can try the default accounts:
                  <br />- Administrator (login=&quot;admin&quot; and password=&quot;admin&quot;)
                  <br />- User (login=&quot;user&quot; and password=&quot;user&quot;).
                </Translate>
              </Alert>

              <Alert color="warning">
                <Translate contentKey="global.messages.info.register.noaccount">You do not have an account yet?</Translate>&nbsp;
                <Link to="/account/register" className="alert-link"><Translate contentKey="global.messages.info.register.link">Register a new account</Translate></Link>
              </Alert>
            </div>
          )
        }
        <p>
          <Translate contentKey="home.question">If you have any question on JHipster:</Translate>
        </p>

        <ul>
          <li>
            <a href="https://www.jhipster.tech/" target="_blank" rel="noopener noreferrer">
              <Translate contentKey="home.link.homepage">JHipster homepage</Translate>
            </a>
          </li>
          <li>
            <a href="https://stackoverflow.com/tags/jhipster/info" target="_blank" rel="noopener noreferrer">
              <Translate contentKey="home.link.stackoverflow">JHipster on Stack Overflow</Translate>
            </a>
          </li>
          <li>
            <a href="https://github.com/jhipster/generator-jhipster/issues?state=open" target="_blank" rel="noopener noreferrer">
              <Translate contentKey="home.link.bugtracker">JHipster bug tracker</Translate>
            </a>
          </li>
          <li>
            <a href="https://gitter.im/jhipster/generator-jhipster" target="_blank" rel="noopener noreferrer">
              <Translate contentKey="home.link.chat">JHipster public chat room</Translate>
            </a>
          </li>
          <li>
            <a href="https://twitter.com/jhipster" target="_blank" rel="noopener noreferrer">
              <Translate contentKey="home.link.follow">follow @jhipster on Twitter</Translate>
            </a>
          </li>
        </ul>

        <p>
          <Translate contentKey="home.like">If you like JHipster, do not forget to give us a star on</Translate>
          {' '}
          <a href="https://github.com/jhipster/generator-jhipster" target="_blank" rel="noopener noreferrer">GitHub</a>!
        </p>
      </Col>
    </Row>
  );
};

export default Home;
`;
          expect(replaceReactTranslations(body, extension)).toMatchInlineSnapshot(`
"
import React from 'react';
import { Link } from 'react-router-dom';

import { Row, Col, Alert } from 'reactstrap';

import { useAppSelector } from 'app/config/store';

export const Home = () => {
  const account = useAppSelector(state => state.authentication.account);

  return (
    <Row>
      <Col md="3" className="pad">
        <span className="hipster rounded" />
      </Col>
      <Col md="9">
        <h2>home.title-translated-value-0</h2>
        <p className="lead">
        home.subtitle-translated-value-1
         </p>
        {
          (account?.login) ? (
            <div>
              <Alert color="success">
                home.logged.message-{&quot;username&quot;:&quot;{account.login}&quot;}-translated-value-2
              </Alert>
            </div>
          ) : (
            <div>
              <Alert color="warning">
                global.messages.info.authenticated.prefix-translated-value-3
                <% if (!enableTranslation) { %><span>&nbsp;</span><% } %>
                <Link to="/login" className="alert-link">global.messages.info.authenticated.link-translated-value-4</Link>
                global.messages.info.authenticated.suffix-translated-value-5
              </Alert>

              <Alert color="warning">
                global.messages.info.register.noaccount-translated-value-6&nbsp;
                <Link to="/account/register" className="alert-link">global.messages.info.register.link-translated-value-7</Link>
              </Alert>
            </div>
          )
        }
        <p>
          home.question-translated-value-8
        </p>

        <ul>
          <li>
            <a href="https://www.jhipster.tech/" target="_blank" rel="noopener noreferrer">
              home.link.homepage-translated-value-9
            </a>
          </li>
          <li>
            <a href="https://stackoverflow.com/tags/jhipster/info" target="_blank" rel="noopener noreferrer">
              home.link.stackoverflow-translated-value-10
            </a>
          </li>
          <li>
            <a href="https://github.com/jhipster/generator-jhipster/issues?state=open" target="_blank" rel="noopener noreferrer">
              home.link.bugtracker-translated-value-11
            </a>
          </li>
          <li>
            <a href="https://gitter.im/jhipster/generator-jhipster" target="_blank" rel="noopener noreferrer">
              home.link.chat-translated-value-12
            </a>
          </li>
          <li>
            <a href="https://twitter.com/jhipster" target="_blank" rel="noopener noreferrer">
              home.link.follow-translated-value-13
            </a>
          </li>
        </ul>

        <p>
          home.like-translated-value-14
          {' '}
          <a href="https://github.com/jhipster/generator-jhipster" target="_blank" rel="noopener noreferrer">GitHub</a>!
        </p>
      </Col>
    </Row>
  );
};

export default Home;
"
`);
        });
      });
    });
  });
});
