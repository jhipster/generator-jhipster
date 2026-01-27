import { describe, it } from 'esmocha';
import { expect } from 'chai';
import { isClientRelationship, isClientField, filterEntityPropertiesForClient } from './filter-entities.ts';

describe('generator - client - support - filter-entities', () => {
  describe('isClientField', () => {
    it('returns true when skipClient is undefined', () => {
      expect(isClientField({ skipClient: undefined } as any)).to.be.true;
    });

    it('returns true when skipClient is false', () => {
      expect(isClientField({ skipClient: false } as any)).to.be.true;
    });

    it('returns false when skipClient is true', () => {
      expect(isClientField({ skipClient: true } as any)).to.be.false;
    });
  });

  describe('isClientRelationship', () => {
    it('returns true for persistable relationship', () => {
      const rel = {
        persistableRelationship: true,
        relationshipEagerLoad: false,
        otherEntity: { jpaMetamodelFiltering: false },
      };
      expect(isClientRelationship(rel as any)).to.be.true;
    });

    it('returns true for eager load relationship', () => {
      const rel = {
        persistableRelationship: false,
        relationshipEagerLoad: true,
        otherEntity: { jpaMetamodelFiltering: false },
      };
      expect(isClientRelationship(rel as any)).to.be.true;
    });

    it('returns true when otherEntity has jpaMetamodelFiltering', () => {
      const rel = {
        persistableRelationship: false,
        relationshipEagerLoad: false,
        otherEntity: { jpaMetamodelFiltering: true },
      };
      expect(isClientRelationship(rel as any)).to.be.true;
    });

    it('returns false when skipClient is true', () => {
      const rel = {
        skipClient: true,
        persistableRelationship: true,
        relationshipEagerLoad: true,
        otherEntity: { jpaMetamodelFiltering: true },
      };
      expect(isClientRelationship(rel as any)).to.be.false;
    });

    it('returns false when relationship is not relevant for client', () => {
      const rel = {
        persistableRelationship: false,
        relationshipEagerLoad: false,
        otherEntity: { jpaMetamodelFiltering: false },
      };
      expect(isClientRelationship(rel as any)).to.be.false;
    });

    it('returns true for ManyToOne relationship (ownerSide=true)', () => {
      const rel = {
        persistableRelationship: true,
        relationshipEagerLoad: true,
        otherEntity: { jpaMetamodelFiltering: false },
      };
      expect(isClientRelationship(rel as any)).to.be.true;
    });
  });

  describe('filterEntityPropertiesForClient', () => {
    it('filters out fields with skipClient=true', () => {
      const entity = {
        fields: [{ fieldName: 'a', skipClient: false }, { fieldName: 'b', skipClient: true }],
        relationships: [],
      };
      const result = filterEntityPropertiesForClient(entity as any);
      expect(result.fields).to.have.length(1);
      expect(result.fields[0].fieldName).to.equal('a');
    });

    it('filters out non-client relationships', () => {
      const entity = {
        fields: [],
        relationships: [
          { relationshipName: 'a', persistableRelationship: true, otherEntity: {} },
          { relationshipName: 'b', persistableRelationship: false, otherEntity: {} },
        ],
      };
      const result = filterEntityPropertiesForClient(entity as any);
      expect(result.relationships).to.have.length(1);
      expect(result.relationships[0].relationshipName).to.equal('a');
    });
  });
});
