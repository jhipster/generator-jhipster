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

import <%=packageName%>.domain.OAuth2AuthenticationApproval;
import <%=packageName%>.repository.OAuth2ApprovalRepository;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.security.oauth2.provider.approval.Approval;
import org.springframework.security.oauth2.provider.approval.ApprovalStore;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

public class MongoDBApprovalStore implements ApprovalStore {

    private final Log logger = LogFactory.getLog(getClass());

    private final OAuth2ApprovalRepository oAuth2ApprovalRepository;

    private boolean handleRevocationsAsExpiry = false;

    public MongoDBApprovalStore(final OAuth2ApprovalRepository oAuth2ApprovalRepository) {
        this.oAuth2ApprovalRepository = oAuth2ApprovalRepository;
    }

    public void setHandleRevocationsAsExpiry(boolean handleRevocationsAsExpiry) {
        this.handleRevocationsAsExpiry = handleRevocationsAsExpiry;
    }

    @Override
    public boolean addApprovals(Collection<Approval> approvals) {
        logger.debug(String.format("adding approvals: [%s]", approvals));

        for (final Approval approval : approvals) {
            List<OAuth2AuthenticationApproval> mongoDBApprovals = this.oAuth2ApprovalRepository
                .findByUserIdAndClientIdAndScope(approval.getUserId(), approval.getClientId(), approval.getScope());

            if (!mongoDBApprovals.isEmpty()) {
                for (final OAuth2AuthenticationApproval mongoDBApproval : mongoDBApprovals) {
                    updateApproval(mongoDBApproval, approval);
                }
            } else {
                updateApproval(new OAuth2AuthenticationApproval(), approval);
            }
        }
        return true;
    }

    private void updateApproval(final OAuth2AuthenticationApproval mongoDBApproval, final Approval approval) {
        logger.debug(String.format("refreshing approval: [%s]", approval));

        mongoDBApproval.setExpiresAt(approval.getExpiresAt());
        mongoDBApproval.setStatus(approval.getStatus() == null ? Approval.ApprovalStatus.APPROVED : approval.getStatus());
        mongoDBApproval.setLastUpdatedAt(approval.getLastUpdatedAt());
        mongoDBApproval.setUserId(approval.getUserId());
        mongoDBApproval.setClientId(approval.getClientId());
        mongoDBApproval.setScope(approval.getScope());

        this.oAuth2ApprovalRepository.save(mongoDBApproval);
    }

    @Override
    public boolean revokeApprovals(Collection<Approval> approvals) {
        logger.debug(String.format("Revoking approvals: [%s]", approvals));
        boolean success = true;

        for (final Approval approval : approvals) {
            List<OAuth2AuthenticationApproval> mongoDBApprovals = this.oAuth2ApprovalRepository
                .findByUserIdAndClientIdAndScope(approval.getUserId(), approval.getClientId(), approval.getScope());

            if (mongoDBApprovals.size() != 1) {
                success = false;
            }

            for (final OAuth2AuthenticationApproval mongoDBApproval : mongoDBApprovals) {
                if (handleRevocationsAsExpiry) {
                    mongoDBApproval.setExpiresAt(new Date());
                    this.oAuth2ApprovalRepository.save(mongoDBApproval);
                } else {
                    this.oAuth2ApprovalRepository.delete(mongoDBApproval);
                }
            }
        }
        return success;
    }

    @Override
    public Collection<Approval> getApprovals(String userId, String clientId) {
        return new ArrayList<>(this.oAuth2ApprovalRepository
            .findByUserIdAndClientId(userId, clientId));
    }
}
