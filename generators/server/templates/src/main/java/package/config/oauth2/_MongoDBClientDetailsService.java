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
package <%=packageName%>.config.oauth2;

import <%=packageName%>.domain.OAuth2AuthenticationClientDetails;
import <%=packageName%>.repository.OAuth2ClientDetailsRepository;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.provider.*;
import org.springframework.security.oauth2.provider.client.BaseClientDetails;

import java.util.ArrayList;
import java.util.List;

public class MongoDBClientDetailsService implements ClientDetailsService, ClientRegistrationService {

    private PasswordEncoder passwordEncoder = NoOpPasswordEncoder.getInstance();

    private OAuth2ClientDetailsRepository oAuth2ClientDetailsRepository;

    public MongoDBClientDetailsService(OAuth2ClientDetailsRepository oAuth2ClientDetailsRepository) {
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
        OAuth2AuthenticationClientDetails mongoClientDetails = oAuth2ClientDetailsRepository.findOneByClientId(clientId);
        if (mongoClientDetails == null) {
            throw new NoSuchClientException("No client with requested id: " + clientId);
        }
        return mongoClientDetails;
    }

    @Override
    public void addClientDetails(ClientDetails clientDetails) throws ClientAlreadyExistsException {
        OAuth2AuthenticationClientDetails mongoClientDetails = oAuth2ClientDetailsRepository.findOneByClientId(clientDetails.getClientId());
        if ( mongoClientDetails != null) {
            throw new ClientAlreadyExistsException("Client already exists: " + clientDetails.getClientId());
        }
        saveClientDetails(mongoClientDetails, clientDetails);
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
        OAuth2AuthenticationClientDetails mongoClientDetails = oAuth2ClientDetailsRepository.findOneByClientId(clientId);
        if (mongoClientDetails == null) {
            throw new NoSuchClientException("No client found with id = " + clientId);
        }
        mongoClientDetails.setClientSecret(passwordEncoder.encode(secret));
        oAuth2ClientDetailsRepository.save(mongoClientDetails);
    }

    @Override
    public void removeClientDetails(String clientId) throws NoSuchClientException {
        OAuth2AuthenticationClientDetails mongoClientDetails = oAuth2ClientDetailsRepository.findOneByClientId(clientId);
        if (mongoClientDetails == null) {
            throw new NoSuchClientException("No client found with id = " + clientId);
        }
        oAuth2ClientDetailsRepository.delete(mongoClientDetails);
    }

    @Override
    public List<ClientDetails> listClientDetails() {
        return new ArrayList<>(oAuth2ClientDetailsRepository.findAll());
    }

    public void saveClientDetails(OAuth2AuthenticationClientDetails mongoClientDetails, ClientDetails clientDetails) {
        mongoClientDetails.setClientId(clientDetails.getClientId());
        mongoClientDetails.setClientSecret(clientDetails.getClientSecret() != null ? passwordEncoder.encode(clientDetails.getClientSecret()) : null);
        mongoClientDetails.setScope(clientDetails.getScope());
        mongoClientDetails.setResourceIds(clientDetails.getResourceIds());
        mongoClientDetails.setAuthorizedGrantTypes(clientDetails.getAuthorizedGrantTypes());
        mongoClientDetails.setRegisteredRedirectUri(clientDetails.getRegisteredRedirectUri());
        mongoClientDetails.setAuthorities(clientDetails.getAuthorities());
        mongoClientDetails.setAccessTokenValiditySeconds(clientDetails.getAccessTokenValiditySeconds());
        mongoClientDetails.setRefreshTokenValiditySeconds(clientDetails.getRefreshTokenValiditySeconds());
        mongoClientDetails.setAdditionalInformation(clientDetails.getAdditionalInformation());
        if(clientDetails instanceof BaseClientDetails) {
            mongoClientDetails.setAutoApproveScopes(((BaseClientDetails)clientDetails).getAutoApproveScopes());
        }
        oAuth2ClientDetailsRepository.save(mongoClientDetails);
    }
}
