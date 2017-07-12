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

import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * @see QueryUtil
 */
public class QueryUtilUnitTest {
    @Test
    public void decodeQuerySimple() throws Exception {
        assertThat(QueryUtil.decodeQuery("abcABC%20123")).isEqualTo("abcABC 123");
    }

    @Test
    public void decodeQueryWithNonAscii() throws Exception {
        assertThat(QueryUtil.decodeQuery("%C3%AEnf%C4%83%C5%A3i%C5%9F%C3%A2nd%20%C3%8EMBR%C4%82%C5%A2I%C5%9E%C3%82ND")).isEqualTo("înfăţişând ÎMBRĂŢIŞÂND");
    }

    @Test
    public void decodeQueryWithEscapes() throws Exception {
        assertThat(QueryUtil.decodeQuery("%22A'B%20%C2%B1")).isEqualTo("\"A\'B ±");
    }

    @Test
    public void decodeQueryWithNonAsciiVarious() throws Exception {
        assertThat(QueryUtil.decodeQuery("%C3%9F%C3%A6%C5%82%C9%B0%E2%81%87%E2%9D%B7%E2%81%B6")).isEqualTo("ßæłɰ⁇❷⁶");
    }

    @Test(expected = IllegalArgumentException.class)
    public void decodeQueryInvalidArgument() throws Exception {
        QueryUtil.decodeQuery("%+");
    }

    @Test()
    public void decodeQueryEmpty() throws Exception {
        assertThat(QueryUtil.decodeQuery("")).isEqualTo("");
    }
}
