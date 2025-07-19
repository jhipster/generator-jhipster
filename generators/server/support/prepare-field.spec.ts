import { describe, expect, it } from 'esmocha';
import type { Entity as SpringBootEntity, Field as SpringBootField } from '../types.d.ts';
import { prepareMapstructField } from './prepare-field.js';

describe('prepareField', () => {
  describe('prepareMapstructField', () => {
    const testEntity = Object.freeze({ name: 'Entity' }) as unknown as SpringBootEntity;
    const mapstructField = Object.freeze({
      fieldName: 'name',
      fieldType: 'String',
      mapstructExpression: 'java()',
    }) as unknown as SpringBootField;

    describe('with dto != mapstruct and @MapstructExpression', () => {
      it('should fail', () => {
        expect(() => prepareMapstructField({ ...testEntity, dto: 'any' }, { ...mapstructField })).toThrow(
          /^@MapstructExpression requires an Entity with mapstruct dto \[Entity.name\].$/,
        );
      });
    });
    describe('with dto == mapstruct and @MapstructExpression', () => {
      let field: any;
      beforeEach(() => {
        field = prepareMapstructField({ ...testEntity, dto: 'mapstruct' }, { ...mapstructField });
      });
      it('should set field as transient and readonly', () => {
        expect(field.transient).toBe(true);
        expect(field.readonly).toBe(true);
      });
    });
  });
});
