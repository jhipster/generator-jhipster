/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { asWriteFilesSection, asWritingEntitiesTask, asWritingTask } from '../base-application/support/index.ts';
import { clientApplicationTemplatesBlock, clientRootTemplatesBlock, clientSrcTemplatesBlock } from '../client/support/files.ts';
import type { Application as ClientApplication, Entity as ClientEntity } from '../client/types.ts';

export const vueFiles = asWriteFilesSection({
  common: [
    clientRootTemplatesBlock({
      templates: [
        'eslint.config.ts.jhi.vue',
        'package.json',
        'tsconfig.json',
        'tsconfig.app.json',
        'tsconfig.node.json',
        'tsconfig.vitest.json',
        'vite.config.ts',
        'vitest.config.ts',
        { condition: data => data.clientBundlerRsbuild, file: 'rsbuild.config.ts' },
      ],
    }),
  ],
  microfrontend: [
    clientRootTemplatesBlock({
      condition: data => data.microfrontend,
      templates: ['module-federation.config.ts'],
    }),
    {
      condition: generator => generator.microfrontend,
      ...clientApplicationTemplatesBlock(),
      templates: ['index.ts', 'layouts/error/error-loading.vue', 'layouts/error/error-loading.spec.ts'],
    },
  ],
  sass: [
    {
      ...clientSrcTemplatesBlock(),
      templates: ['content/scss/_bootstrap-variables.scss', 'content/scss/global.scss', 'content/scss/vendor.scss'],
    },
  ],
  vueApp: [
    {
      ...clientApplicationTemplatesBlock(),
      templates: [
        'app.vue',
        'app.component.ts',
        'shims-vue.d.ts',
        'declarations.d.ts',
        'main.ts',
        'shared/alert/alert.service.ts',
        'shared/alert/alert.service.spec.ts',
        'config/axios-interceptor.ts',
        'config/axios-interceptor.spec.ts',
        'config/config.ts',
        'config/config-bootstrap-vue.ts',
        'config/dayjs.ts',
        'stores/account-store.ts',
        'stores/index.ts',
        'router/index.ts',
        'router/index.spec.ts',
        'router/admin.ts',
        'router/pages.ts',
        'test-setup.ts',
      ],
    },
  ],
  i18n: [
    {
      condition: generator => generator.enableTranslation,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'shared/language/translation.service.ts',
        'stores/translation-store.ts',
        'stores/translation-store.spec.ts',
        'config/languages.ts',
      ],
    },
    clientRootTemplatesBlock({
      condition: ctx => ctx.enableTranslation && ctx.enableI18nRTL,
      templates: ['postcss.config.ts'],
    }),
  ],
  sharedVueApp: [
    {
      ...clientApplicationTemplatesBlock(),
      templates: [
        'home/home.vue',
        'home/home.component.ts',
        'home/home.component.spec.ts',
        'layouts/error/error.vue',
        'layouts/error/error.component.ts',
        'layouts/error/error.component.spec.ts',
        'layouts/footer/footer.vue',
        'layouts/footer/footer.component.ts',
        'layouts/navbar/navbar.vue',
        'layouts/navbar/navbar.component.ts',
        'layouts/navbar/navbar.component.spec.ts',
        'layouts/ribbon/ribbon.vue',
        'layouts/ribbon/ribbon.component.ts',
        'layouts/ribbon/ribbon.component.spec.ts',
        'composables/date-format.ts',
        'composables/date-format.spec.ts',
        'composables/entity-remove.ts',
        'composables/entity-remove.spec.ts',
        'composables/index.ts',
        'composables/validation.ts',
        'composables/validation.spec.ts',
        'utils/arrays.ts',
        'utils/arrays.spec.ts',
        'utils/index.ts',
        'components/jhi-sort-indicator.component.ts',
        'components/jhi-sort-indicator.vue',
        'utils/sorts.ts',
        'utils/sorts.spec.ts',
        'testing/stubs.ts',
        'composables/data-utils.ts',
        'composables/data-utils.spec.ts',
        'components/jhi-item-count.component.ts',
        'components/jhi-item-count.vue',
        'entities/user/user.model.ts',
        'entities/user/user.model.spec.ts',
        'shared/jhipster/data-utils.spec.ts',
        'shared/jhipster/headers.spec.ts',
        'shared/jhipster/link-header.spec.ts',
      ],
    },
  ],
  accountModule: [
    {
      ...clientApplicationTemplatesBlock(),
      templates: ['account/account.service.ts', 'account/account.service.spec.ts'],
    },
    {
      condition: generator => !generator.authenticationTypeOauth2,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'account/login-form/login-form.vue',
        'account/login-form/login-form.component.ts',
        'account/login-form/login-form.component.spec.ts',
        'account/login-modal.ts',
        'account/login-modal.spec.ts',
        'router/account.ts',
      ],
    },
    {
      condition: generator => generator.generateUserManagement,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'account/change-password/change-password.vue',
        'account/change-password/change-password.component.ts',
        'account/change-password/change-password.component.spec.ts',
        'account/register/register.vue',
        'account/register/register.component.ts',
        'account/register/register.component.spec.ts',
        'account/register/register.service.ts',
        'account/reset-password/init/reset-password-init.vue',
        'account/reset-password/init/reset-password-init.component.ts',
        'account/reset-password/init/reset-password-init.component.spec.ts',
        'account/reset-password/finish/reset-password-finish.vue',
        'account/reset-password/finish/reset-password-finish.component.ts',
        'account/reset-password/finish/reset-password-finish.component.spec.ts',
        'account/settings/settings.vue',
        'account/settings/settings.component.ts',
        'account/settings/settings.component.spec.ts',
        'account/activate/activate.component.ts',
        'account/activate/activate.component.spec.ts',
        'account/activate/activate.service.ts',
        'account/activate/activate.vue',
      ],
    },
    {
      condition: generator => generator.authenticationTypeSession && generator.generateUserManagement,
      ...clientApplicationTemplatesBlock(),
      templates: ['account/sessions/sessions.vue', 'account/sessions/sessions.component.ts', 'account/sessions/sessions.component.spec.ts'],
    },
    {
      condition: generator => generator.authenticationUsesCsrf,
      ...clientApplicationTemplatesBlock(),
      templates: ['account/login.service.ts', 'account/login.service.spec.ts'],
    },
  ],
  adminModule: [
    {
      ...clientApplicationTemplatesBlock(),
      templates: ['admin/docs/docs.vue', 'admin/docs/docs.component.ts', 'admin/docs/docs.component.spec.ts'],
    },
    {
      ...clientApplicationTemplatesBlock(),
      condition: generator => generator.withAdminUi,
      templates: [
        'admin/configuration/configuration.vue',
        'admin/configuration/configuration.component.ts',
        'admin/configuration/configuration.component.spec.ts',
        'admin/configuration/configuration.service.ts',
        'admin/health/health.vue',
        'admin/health/health.component.ts',
        'admin/health/health.component.spec.ts',
        'admin/health/health-modal.vue',
        'admin/health/health-modal.component.ts',
        'admin/health/health-modal.component.spec.ts',
        'admin/health/health.service.ts',
        'admin/health/health.service.spec.ts',
        'admin/logs/logs.vue',
        'admin/logs/logs.component.ts',
        'admin/logs/logs.component.spec.ts',
        'admin/logs/logs.service.ts',
        'admin/metrics/metrics.vue',
        'admin/metrics/metrics.component.ts',
        'admin/metrics/metrics.component.spec.ts',
        'admin/metrics/metrics.service.ts',
        'admin/metrics/metrics-modal.vue',
        'admin/metrics/metrics-modal.component.ts',
        'admin/metrics/metrics-modal.component.spec.ts',
      ],
    },
    {
      condition: generator => generator.communicationSpringWebsocket,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'admin/tracker/tracker.vue',
        'admin/tracker/tracker.component.ts',
        'admin/tracker/tracker.component.spec.ts',
        'admin/tracker/tracker.service.ts',
        'admin/tracker/tracker.service.spec.ts',
      ],
    },
    {
      condition: ctx => ctx.applicationTypeGateway && ctx.gatewayServicesApiAvailable,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'admin/gateway/gateway.vue',
        'admin/gateway/gateway.component.ts',
        'admin/gateway/gateway.component.spec.ts',
        'admin/gateway/gateway.service.ts',
      ],
    },
    {
      condition: generator => generator.generateBuiltInUserEntity,
      ...clientApplicationTemplatesBlock(),
      templates: ['entities/user/user.service.ts', 'entities/user/user.service.spec.ts'],
    },
  ],
});

export const entitiesFiles = {
  entities: [
    {
      ...clientApplicationTemplatesBlock(),
      templates: [
        'entities/entities.component.ts',
        'entities/entities.vue',
        'entities/entities.component.spec.ts',
        'entities/entities-menu.component.ts',
        'entities/entities-menu.vue',
        'entities/entities-menu.spec.ts',
        'entities/entities.routes.ts',
      ],
    },
  ],
};

export const writeFiles = asWritingTask<ClientEntity, ClientApplication>(async function writeFiles({ application }) {
  await this.writeFiles({
    sections: vueFiles,
    context: application,
  });
});

export const writeEntitiesFiles = asWritingEntitiesTask<ClientEntity, ClientApplication>(async function writeEntitiesFiles({
  application,
  entities,
}) {
  entities = entities.filter(entity => !entity.skipClient && !entity.builtInUser);
  await this.writeFiles({
    sections: entitiesFiles,
    context: {
      ...application,
      entities,
    },
  });
});
