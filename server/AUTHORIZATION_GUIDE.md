# Authorization Middleware Guide

## Overview

The backend now enforces role-based authorization on top of the JWT authentication layer. Use the `authorize` middleware to restrict access per-route, while optionally granting self-service access for resource owners (e.g., updating the own user profile or time entries).

```
import { authorize } from "../middleware/authorize";
import { UserRole } from "../models/User";

router.put(
  "/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { params: ["id"] } }),
  controller.update
);
```

## Options

| Option | Description |
| ------ | ----------- |
| `roles` | Array of roles allowed to access the route. If omitted, any authenticated role passes. |
| `allowSelf` | Enables ownership checks so the authenticated user can access the resource even if not in `roles`. Accepts `true` (uses default keys) or an object with fine-grained settings. |
| `allowSelf.params` | List of path parameters to compare with `req.userId`. |
| `allowSelf.query` | List of query-string keys to compare with `req.userId`. |
| `allowSelf.body` | List of body keys (supports dot notation) to compare with `req.userId`. |
| `allowSelf.resolver` | Async/sync callback returning the owner id for complex resources (e.g., load from database). |

## Default Behavior

- Every request must pass through `authenticate` before `authorize`.
- If `roles` is empty or omitted, any authenticated role is allowed.
- When `allowSelf` is `true`, the middleware uses defaults: `params: ["id"]`, `query: ["userId"]`, `body: ["userId"]`.
- If neither role nor ownership checks pass, the middleware throws a `403 Forbidden` error.

## Patterns

### Self-Service Updates
Allow users to view or edit their own records while keeping managers/admins in control:
```
router.get(
  "/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: true }),
  controller.get
);
```

### Resource Ownership via Resolver
Fetch the resource owner when the identifier is not directly available in params/body:
```
const resolveEntryOwner = async (req: AuthenticatedRequest) => {
  const entry = await timeEntryService.getEntryById(req.params.id);
  return entry.userId;
};

router.put(
  "/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { resolver: resolveEntryOwner } }),
  controller.update
);
```

### Read-Only Access with Filters
Combine a guard and a normalizer to force employees to query their own data:
```
const restrictToSelf: RequestHandler = (req, _res, next) => {
  if (req.userRole !== UserRole.ADMIN && req.userRole !== UserRole.MANAGER) {
    req.query.userId = req.userId ?? "";
  }
  next();
};

router.get(
  "/requests",
  restrictToSelf,
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { query: ["userId"] } }),
  controller.list
);
```

## Protected Areas

- **Clients:** only managers/admins can create, edit or remove.
- **Projects:** managers/admins manage projects and membership; deletion restricted to admins.
- **Users:** listing and creation reserved for admins/managers; individuals may fetch/update their own profile.
- **Time entries:** employees can manage their own entries; managers/admins manage everyone.
- **Vacations:** managers/admins manage periods; employees can interact with their own requests.

Keep this guide handy when adding new routes to ensure consistent authorization across the API.
