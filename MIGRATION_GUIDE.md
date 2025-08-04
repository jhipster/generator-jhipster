# Migration Guide: From test-integration Scripts to GitHub Actions

## Overview

This document outlines the migration from the old `test-integration/scripts/` approach to the new GitHub Actions-based approach for JHipster testing.

## What Changed

### Before (Old Approach)
- **Shell Scripts**: Complex bash scripts in `test-integration/scripts/`
- **Static Samples**: Static JSON files in `test-integration/samples/`
- **Tight Coupling**: Workflows directly called shell scripts
- **Poor DX**: Hard to maintain and debug

### After (New Approach)
- **GitHub Actions**: Reusable composite actions in `.github/actions/`
- **Dynamic Templates**: EJS templates in `generators/generate-blueprint/templates/`
- **Loose Coupling**: Workflows use parameterized actions
- **Better DX**: Type-safe, testable, and maintainable

## New Actions Created

### 1. `init-environment`
**Purpose**: Initialize environment variables for JHipster testing
**Replaces**: `test-integration/scripts/00-init-env.sh`

```yaml
- name: 'Initialize environment'
  uses: ./.github/actions/init-environment@v0
  with:
    generator-path: generator-jhipster
```

### 2. `generate-sample-config`
**Purpose**: Generate sample configuration and entities
**Replaces**: `test-integration/scripts/11-generate-config.sh`

```yaml
- name: 'Generate sample configuration'
  uses: ./.github/actions/generate-sample-config@v0
  with:
    sample-name: ng-default
    database-type: sql
```

### 3. `generate-project`
**Purpose**: Generate JHipster project from configuration
**Replaces**: `test-integration/scripts/12-generate-project.sh`

```yaml
- name: 'Generate project'
  uses: ./.github/actions/generate-project@v0
  with:
    sample-name: ng-default
    extra-args: --blueprints foo
```

## Template-Based Samples

Samples are now generated using EJS templates instead of static JSON files:

### Before
```json
// test-integration/samples/ng-default/.yo-rc.json
{
  "generator-jhipster": {
    "baseName": "jhipsterSampleApplication",
    "databaseType": "sql"
  }
}
```

### After
```ejs
// generators/generate-blueprint/templates/samples/ng-default/.yo-rc.json.ejs
{
  "generator-jhipster": {
    "baseName": "<%= baseName %>",
    "databaseType": "<%= databaseType %>"
  }
}
```

## Migration Steps

### 1. Update Workflows
Replace script calls with action calls:

```yaml
# Old
- run: $JHI_SCRIPTS/11-generate-config.sh
- run: $JHI_SCRIPTS/12-generate-project.sh

# New
- uses: ./.github/actions/generate-sample-config@v0
- uses: ./.github/actions/generate-project@v0
```

### 2. Convert Samples to Templates
Move sample configurations to templates:

1. Copy sample from `test-integration/samples/` to `generators/generate-blueprint/templates/samples/`
2. Convert static JSON to EJS templates
3. Add dynamic parameters (baseName, databaseType, etc.)

### 3. Update Entity Generation
Replace hardcoded entity lists with template-based generation:

```typescript
// In generate-blueprint generator
async generateEntitiesForDatabase(databaseType: string) {
  const entities = this.getEntitiesForDatabase(databaseType);
  for (const entity of entities) {
    await this.generateEntity(entity);
  }
}
```

## Benefits

1. **Maintainability**: TypeScript is easier to maintain than bash
2. **Testability**: Can unit test generator logic
3. **Reusability**: Actions can be reused across workflows
4. **Developer Experience**: Better IDE support and type safety
5. **Extensibility**: Easy to add new database types or entities

## Next Steps

1. **Complete Migration**: Update all remaining workflows
2. **Remove Old Scripts**: Delete `test-integration/scripts/` after migration
3. **Update Documentation**: Update all references to old approach
4. **Add Tests**: Add unit tests for new actions and templates

## Files Modified

- `.github/actions/init-environment/action.yml` (new)
- `.github/actions/generate-sample-config/action.yml` (new)
- `.github/actions/generate-project/action.yml` (new)
- `.github/actions/generate/action.yml` (updated)
- `generators/generate-blueprint/constants.ts` (updated)
- `generators/generate-blueprint/generator.ts` (updated)
- `generators/generate-blueprint/templates/samples/` (new templates)
- `.github/workflows/generator-generate-blueprint.yml` (updated)

## Testing

To test the new approach:

```bash
# Generate a sample using the new approach
jhipster generate-blueprint --sample-generation --sample-name ng-default --database-type sql

# Or use the new actions in a workflow
- uses: ./.github/actions/generate-sample-config@v0
  with:
    sample-name: ng-default
    database-type: sql
``` 