import _ from 'lodash';

export default function entityIsAuthority(entityName) {
  return _.upperFirst(entityName) === 'Authority';
}
