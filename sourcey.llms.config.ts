import { defineConfig, markdown } from 'sourcey';

export default defineConfig({
  name: 'generator-jhipster',
  description:
    'Architecture, development, contribution, blueprint, and RFC documentation from generator-jhipster commit 819adc170c499f0871a9b77c32d6f98b00f8e391.',
  baseUrl: '/generator-jhipster',
  prettyUrls: 'slash',
  navigation: {
    tabs: [
      {
        tab: 'Documentation',
        slug: '',
        source: markdown({
          groups: [
            {
              group: 'Contributor Guide',
              pages: ['ARCHITECTURE', 'DEVELOPMENT', 'CONTRIBUTING', 'BLUEPRINTS'],
            },
            {
              group: 'Design RFCs',
              pages: [
                'rfcs/1-jhipster-rfc-k8s-operator',
                'rfcs/2-jhipster-rfc-jhipster-control-center',
                'rfcs/4-jhipster-rfc-entity-as-core',
                'rfcs/6-jhipster-rfc-jhipster-generator-file-structure',
              ],
            },
          ],
        }),
      },
    ],
  },
});
