# PR #32359 Refactor Summary

## Diff summary – what was changed and why

### Removed / aligned

1. **List trackBy (generator consistency)**  
   **Before:** `trackIdentity = (item) => item.login!` (direct property access).  
   **After:** `trackIdentity = (item) => this.<entity>Service.get<Entity>Identifier(item)`.  
   **Why:** Identifier is now the single source of truth in the entity service; list follows the same pattern as other entities (delegate to service).

2. **Authority import (authorities handling)**  
   **Before:** `import { Authority } from 'app/config/authority.constants'` in the entity service.  
   **After:** `import { Authority } from 'app/shared/jhipster/constants'`.  
   **Why:** `app/config/authority.constants` is no longer generated (cleanup); `app.routes.ts.ejs` and `account.service.spec.ts.ejs` use `app/shared/jhipster/constants`. Entity templates use the same canonical source.

3. **List spec – trackIdentity test**  
   **Before:** Test asserted `trackIdentity(entity)` returns `entity.login`.  
   **After:** Test spies on `get<Entity>Identifier`, asserts it is called with the entity, and asserts the return value (same pattern as non–user-management `track<PrimaryKey>` test).  
   **Why:** Structural alignment with entity template tests; ensures trackBy delegates to the service.

### Unchanged (minimal builtInUserManagement only)

- Delete dialog, routing resolve, routes, detail, update: only existing `builtInUserManagement` branches for login vs id, setActive, authorities, currentAccount for self-disable, and user-management columns/actions. No extra logic added or removed in this refactor.

---

## Authorities alignment

- **Single source:** Authority is imported from `app/shared/jhipster/constants` in the entity service (fallback list when `!generateBuiltInAuthorityEntity`).
- **Route data:** Entity route `data.authorities` remain generator-driven (`entityAngularReadAuthorities` / `entityAngularAuthorities` from `entity.entityAuthority` / `entity.entityReadAuthority`). No hardcoded role arrays in entity routes.
- **No duplication:** Authority mapping lives in the service (`authorities()`, `convertUserManagementFromClient` / `convertUserManagementResponseFromServer`). Components only subscribe to `authorities()` or display the entity’s authorities; no extra role logic in components.

---

## Architecture

The result uses the **same entity template architecture** as standard entities (list, detail, update, delete, service, routing resolve, routes). The only differences for User Management are the minimal `builtInUserManagement` branches for: (1) login vs id in params/URLs/identifiers, (2) `setActive()`, (3) `authorities()` and conversion helpers, (4) `currentAccount` for self-disable, and (5) user-management-only columns and activate/deactivate UI. No new features or abstractions; align and simplify only.
