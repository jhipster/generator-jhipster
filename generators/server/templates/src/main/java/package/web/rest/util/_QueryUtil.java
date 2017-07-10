<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.web.rest.util;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;

/**
 * Utility class for query manipulation.
 */
public class QueryUtil {
    /**
     * Decodes the query string as encoded on client side using <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent</a>.
     * @param query the client encoded query string
     * @return the decoded query string
     * @throws {IllegalArgumentException} the query string must be correctly encoded
     */
    public static String decodeQuery(final String query) {
        final String decodedQuery;
        try {
            decodedQuery = URLDecoder.decode(query, "UTF-8");
        } catch (final UnsupportedEncodingException ex) {
            throw new IllegalArgumentException("Invalid encoded query string", ex);
        }
        return decodedQuery;
    }
}
