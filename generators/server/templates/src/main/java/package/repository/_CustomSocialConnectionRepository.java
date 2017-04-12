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
package <%=packageName%>.repository;

import <%=packageName%>.domain.SocialUserConnection;

import org.springframework.social.connect.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.*;
import java.util.stream.Collectors;

public class CustomSocialConnectionRepository implements ConnectionRepository {

    private String userId;

    private SocialUserConnectionRepository socialUserConnectionRepository;

    private ConnectionFactoryLocator connectionFactoryLocator;

    public CustomSocialConnectionRepository(String userId, SocialUserConnectionRepository socialUserConnectionRepository, ConnectionFactoryLocator connectionFactoryLocator) {
        this.userId = userId;
        this.socialUserConnectionRepository = socialUserConnectionRepository;
        this.connectionFactoryLocator = connectionFactoryLocator;
    }

    @Override
    public MultiValueMap<String, Connection<?>> findAllConnections() {
        List<SocialUserConnection> socialUserConnections = socialUserConnectionRepository.findAllByUserIdOrderByProviderIdAscRankAsc(userId);
        List<Connection<?>> connections = socialUserConnectionsToConnections(socialUserConnections);
        MultiValueMap<String, Connection<?>> connectionsByProviderId = new LinkedMultiValueMap<>();
        Set<String> registeredProviderIds = connectionFactoryLocator.registeredProviderIds();
        for (String registeredProviderId : registeredProviderIds) {
            connectionsByProviderId.put(registeredProviderId, Collections.emptyList());
        }
        for (Connection<?> connection : connections) {
            String providerId = connection.getKey().getProviderId();
            if (connectionsByProviderId.get(providerId).size() == 0) {
                connectionsByProviderId.put(providerId, new LinkedList<>());
            }
            connectionsByProviderId.add(providerId, connection);
        }
        return connectionsByProviderId;
    }

    @Override
    public List<Connection<?>> findConnections(String providerId) {
        List<SocialUserConnection> socialUserConnections = socialUserConnectionRepository.findAllByUserIdAndProviderIdOrderByRankAsc(userId, providerId);
        return socialUserConnectionsToConnections(socialUserConnections);
    }

    @Override
    @SuppressWarnings("unchecked")
    public <A> List<Connection<A>> findConnections(Class<A> apiType) {
        List<?> connections = findConnections(getProviderId(apiType));
        return (List<Connection<A>>) connections;
    }

    @Override
    public MultiValueMap<String, Connection<?>> findConnectionsToUsers(MultiValueMap<String, String> providerUserIdsByProviderId) {
        if (providerUserIdsByProviderId == null || providerUserIdsByProviderId.isEmpty()) {
            throw new IllegalArgumentException("Unable to execute find: no providerUsers provided");
        }

        MultiValueMap<String, Connection<?>> connectionsForUsers = new LinkedMultiValueMap<>();
        for (Map.Entry<String, List<String>> entry : providerUserIdsByProviderId.entrySet()) {
            String providerId = entry.getKey();
            List<String> providerUserIds = entry.getValue();
            List<Connection<?>> connections = providerUserIdsToConnections(providerId, providerUserIds);
            connections.forEach(connection -> connectionsForUsers.add(providerId, connection));
        }
        return connectionsForUsers;
    }

    @Override
    public Connection<?> getConnection(ConnectionKey connectionKey) {
        SocialUserConnection socialUserConnection = socialUserConnectionRepository.findOneByUserIdAndProviderIdAndProviderUserId(userId, connectionKey.getProviderId(), connectionKey.getProviderUserId());
        return Optional.ofNullable(socialUserConnection)
            .map(this::socialUserConnectionToConnection)
            .orElseThrow(() -> new NoSuchConnectionException(connectionKey));
    }

    @Override
    @SuppressWarnings("unchecked")
    public <A> Connection<A> getConnection(Class<A> apiType, String providerUserId) {
        String providerId = getProviderId(apiType);
        return (Connection<A>) getConnection(new ConnectionKey(providerId, providerUserId));
    }

    @Override
    @SuppressWarnings("unchecked")
    public <A> Connection<A> getPrimaryConnection(Class<A> apiType) {
        String providerId = getProviderId(apiType);
        Connection<A> connection = (Connection<A>) findPrimaryConnection(providerId);
        if (connection == null) {
            throw new NotConnectedException(providerId);
        }
        return connection;
    }

    @Override
    @SuppressWarnings("unchecked")
    public <A> Connection<A> findPrimaryConnection(Class<A> apiType) {
        String providerId = getProviderId(apiType);
        return (Connection<A>) findPrimaryConnection(providerId);
    }

    @Override
    @Transactional
    public void addConnection(Connection<?> connection) {
        Long rank = getNewMaxRank(connection.getKey().getProviderId()).longValue();
        SocialUserConnection socialUserConnectionToSave = connectionToUserSocialConnection(connection, rank);
        socialUserConnectionRepository.save(socialUserConnectionToSave);
    }

    @Override
    @Transactional
    public void updateConnection(Connection<?> connection) {
        SocialUserConnection socialUserConnection = socialUserConnectionRepository.findOneByUserIdAndProviderIdAndProviderUserId(userId, connection.getKey().getProviderId(), connection.getKey().getProviderUserId());
        if (socialUserConnection != null) {
            SocialUserConnection socialUserConnectionToUdpate =  connectionToUserSocialConnection(connection, socialUserConnection.getRank());
            socialUserConnectionToUdpate.setId(socialUserConnection.getId());
            socialUserConnectionRepository.save(socialUserConnectionToUdpate);
        }
    }

    @Override
    @Transactional
    public void removeConnections(String providerId) {
        socialUserConnectionRepository.deleteByUserIdAndProviderId(userId, providerId);
    }

    @Override
    @Transactional
    public void removeConnection(ConnectionKey connectionKey) {
        socialUserConnectionRepository.deleteByUserIdAndProviderIdAndProviderUserId(userId, connectionKey.getProviderId(), connectionKey.getProviderUserId());
    }

    private Double getNewMaxRank(String providerId) {
        List<SocialUserConnection> socialUserConnections = socialUserConnectionRepository.findAllByUserIdAndProviderIdOrderByRankAsc(userId, providerId);
        return socialUserConnections.stream()
            .mapToDouble(SocialUserConnection::getRank)
            .max()
            .orElse(0D) + 1D;
    }

    private Connection<?> findPrimaryConnection(String providerId) {
        List<SocialUserConnection> socialUserConnections = socialUserConnectionRepository.findAllByUserIdAndProviderIdOrderByRankAsc(userId, providerId);
        if (socialUserConnections.size() > 0) {
            return socialUserConnectionToConnection(socialUserConnections.get(0));
        } else {
            return null;
        }
    }

    private SocialUserConnection connectionToUserSocialConnection(Connection<?> connection, Long rank) {
        ConnectionData connectionData = connection.createData();
        return new SocialUserConnection(
            userId,
            connection.getKey().getProviderId(),
            connection.getKey().getProviderUserId(),
            rank,
            connection.getDisplayName(),
            connection.getProfileUrl(),
            connection.getImageUrl(),
            connectionData.getAccessToken(),
            connectionData.getSecret(),
            connectionData.getRefreshToken(),
            connectionData.getExpireTime()
        );
    }

    private List<Connection<?>> providerUserIdsToConnections(String providerId, List<String> providerUserIds) {
        List<SocialUserConnection> socialUserConnections = socialUserConnectionRepository.findAllByUserIdAndProviderIdAndProviderUserIdIn(userId, providerId, providerUserIds);
        return socialUserConnectionsToConnections(socialUserConnections);
    }

    private List<Connection<?>> socialUserConnectionsToConnections(List<SocialUserConnection> socialUserConnections) {
        return socialUserConnections.stream()
            .map(this::socialUserConnectionToConnection)
            .collect(Collectors.toList());
    }

    private Connection<?> socialUserConnectionToConnection(SocialUserConnection socialUserConnection) {
        ConnectionData connectionData = new ConnectionData(socialUserConnection.getProviderId(),
            socialUserConnection.getProviderUserId(),
            socialUserConnection.getDisplayName(),
            socialUserConnection.getProfileURL(),
            socialUserConnection.getImageURL(),
            socialUserConnection.getAccessToken(),
            socialUserConnection.getSecret(),
            socialUserConnection.getRefreshToken(),
            socialUserConnection.getExpireTime());
        ConnectionFactory<?> connectionFactory = connectionFactoryLocator.getConnectionFactory(connectionData.getProviderId());
        return connectionFactory.createConnection(connectionData);
    }

    private <A> String getProviderId(Class<A> apiType) {
        return connectionFactoryLocator.getConnectionFactory(apiType).getProviderId();
    }
}
