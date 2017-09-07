<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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
package <%=packageName%>.config.oauth2;

import <%=packageName%>.domain.OAuth2AuthenticationClientDetails;
import <%=packageName%>.repository.OAuth2ClientDetailsRepository;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.provider.*;
import org.springframework.security.oauth2.provider.client.BaseClientDetails;

import java.util.ArrayList;
import java.util.List;

public class DocumentDBClientDetailsService implements ClientDetailsService, ClientRegistrationService {

    private PasswordEncoder passwordEncoder = NoOpPasswordEncoder.getInstance();

    private OAuth2ClientDetailsRepository oAuth2ClientDetailsRepository;

    public DocumentDBClientDetailsService(OAuth2ClientDetailsRepository oAuth2ClientDetailsRepository) {
        this.oAuth2ClientDetailsRepository = oAuth2ClientDetailsRepository;
    }

    /**
     * @param passwordEncoder the password encoder to set.
     */
    public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public ClientDetails loadClientByClientId(String clientId) throws ClientRegistrationException {
        OAuth2AuthenticationClientDetails dbClientDetails = oAuth2ClientDetailsRepository.findOneByClientId(clientId);
        if (dbClientDetails == null) {
            throw new NoSuchClientException("No client with requested id: " + clientId);
        }
        return dbClientDetails;
    }

    @Override
    public void addClientDetails(ClientDetails clientDetails) throws ClientAlreadyExistsException {
        OAuth2AuthenticationClientDetails dbClientDetails = oAuth2ClientDetailsRepository.findOneByClientId(clientDetails.getClientId());
        if ( dbClientDetails != null) {
            throw new ClientAlreadyExistsException("Client already exists: " + clientDetails.getClientId());
        }
        saveClientDetails(dbClientDetails, clientDetails);
    }

    @Override
    public void updateClientDetails(ClientDetails clientDetails) throws NoSuchClientException {
        if (oAuth2ClientDetailsRepository.findOneByClientId(clientDetails.getClientId()) == null) {
            throw new NoSuchClientException("No client found with id = " + clientDetails.getClientId());
        }
        saveClientDetails(new OAuth2AuthenticationClientDetails(), clientDetails);
    }

    @Override
    public void updateClientSecret(String clientId, String secret) throws NoSuchClientException {
        OAuth2AuthenticationClientDetails dbClientDetails = oAuth2ClientDetailsRepository.findOneByClientId(clientId);
        if (dbClientDetails == null) {
            throw new NoSuchClientException("No client found with id = " + clientId);
        }
        dbClientDetails.setClientSecret(passwordEncoder.encode(secret));
        oAuth2ClientDetailsRepository.save(dbClientDetails);
    }

    @Override
    public void removeClientDetails(String clientId) throws NoSuchClientException {
        OAuth2AuthenticationClientDetails dbClientDetails = oAuth2ClientDetailsRepository.findOneByClientId(clientId);
        if (dbClientDetails == null) {
            throw new NoSuchClientException("No client found with id = " + clientId);
        }
        oAuth2ClientDetailsRepository.delete(dbClientDetails);
    }

    @Override
    public List<ClientDetails> listClientDetails() {
        return new ArrayList<>(oAuth2ClientDetailsRepository.findAll());
    }

    public void saveClientDetails(OAuth2AuthenticationClientDetails dbClientDetails, ClientDetails clientDetails) {
        dbClientDetails.setClientId(clientDetails.getClientId());
        dbClientDetails.setClientSecret(clientDetails.getClientSecret() != null ? passwordEncoder.encode(clientDetails.getClientSecret()) : null);
        dbClientDetails.setScope(clientDetails.getScope());
        dbClientDetails.setResourceIds(clientDetails.getResourceIds());
        dbClientDetails.setAuthorizedGrantTypes(clientDetails.getAuthorizedGrantTypes());
        dbClientDetails.setRegisteredRedirectUri(clientDetails.getRegisteredRedirectUri());
        dbClientDetails.setAuthorities(clientDetails.getAuthorities());
        dbClientDetails.setAccessTokenValiditySeconds(clientDetails.getAccessTokenValiditySeconds());
        dbClientDetails.setRefreshTokenValiditySeconds(clientDetails.getRefreshTokenValiditySeconds());
        dbClientDetails.setAdditionalInformation(clientDetails.getAdditionalInformation());
        if(clientDetails instanceof BaseClientDetails) {
            dbClientDetails.setAutoApproveScopes(((BaseClientDetails)clientDetails).getAutoApproveScopes());
        }
        oAuth2ClientDetailsRepository.save(dbClientDetails);
    }
}
