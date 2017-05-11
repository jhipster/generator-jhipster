<%#
 Copyright 2013-2017 the original author or authors.

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
package <%=packageName%>.security.uaa;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;

/**
 * Tests helper functions around OAuth2 Cookies.
 * 
 * @see OAuth2CookieHelper
 */
public class OAuth2CookieHelperTest {
    public static final String GET_COOKIE_DOMAIN_METHOD = "getCookieDomain";
    private OAuth2CookieHelper cookieHelper;

    @Before
    public void setUp() throws NoSuchMethodException {
        cookieHelper = new OAuth2CookieHelper();
    }

   @Test
    public void testLocalhostDomain() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServerName("localhost");
        String name = ReflectionTestUtils.invokeMethod(cookieHelper, GET_COOKIE_DOMAIN_METHOD, request);
        Assert.assertEquals("localhost", name);
    }

    @Test
    public void testComDomain() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServerName("test.com");
        String name = ReflectionTestUtils.invokeMethod(cookieHelper, GET_COOKIE_DOMAIN_METHOD, request);
        Assert.assertEquals("test.com", name);
    }

    @Test
    public void testWwwDomainCom() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServerName("www.test.com");
        String name = ReflectionTestUtils.invokeMethod(cookieHelper, GET_COOKIE_DOMAIN_METHOD, request);
        Assert.assertEquals("test.com", name);
    }

    @Test
    public void testComSubDomain() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServerName("abc.test.com");
        String name = ReflectionTestUtils.invokeMethod(cookieHelper, GET_COOKIE_DOMAIN_METHOD, request);
        Assert.assertEquals(".test.com", name);
    }

    @Test
    public void testCoUkDomain() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServerName("test.co.uk");
        String name = ReflectionTestUtils.invokeMethod(cookieHelper, GET_COOKIE_DOMAIN_METHOD, request);
        Assert.assertEquals("test.co.uk", name);
    }

    @Test
    public void testCoUkSubDomain() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServerName("abc.test.co.uk");
        String name = ReflectionTestUtils.invokeMethod(cookieHelper, GET_COOKIE_DOMAIN_METHOD, request);
        Assert.assertEquals(".test.co.uk", name);
    }

    @Test
    public void testNestedDomain() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServerName("abc.xyu.test.co.uk");
        String name = ReflectionTestUtils.invokeMethod(cookieHelper, GET_COOKIE_DOMAIN_METHOD, request);
        Assert.assertEquals(".test.co.uk", name);
    }
}
