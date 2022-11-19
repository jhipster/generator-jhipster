/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import https from 'https';

/**
 * @private
 * Function to issue a https get request, and process the result
 *
 *  @param {string} url - the url to fetch
 *  @param {function} onSuccess - function, which gets called when the request succeeds, with the body of the response
 *  @param {function} onFail - callback when the get failed.
 */
const httpsGet = (url, onSuccess, onFail) => {
  https
    .get(url, res => {
      let body = '';
      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => {
        onSuccess(body);
      });
    })
    .on('error', onFail);
};

export default httpsGet;
