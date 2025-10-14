# 📝 Project API Documentation

## 🔐 Authentication
All endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📊 Projects Endpoints

### 1. List All Projects
**GET** `/api/projects`

**Query Parameters:**
- `clientId` (optional) - Filter projects by client ID

**Response:** `200 OK`
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "clientId": "507f1f77bcf86cd799439012",
    "name": "E-commerce Platform",
    "description": "Full-stack e-commerce solution",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "client": {
      "id": "507f1f77bcf86cd799439012",
      "name": "Tech Corp",
      "cnpj": "12.345.678/0001-90"
    }
  }
]
```

---

### 2. Get Project by ID
**GET** `/api/projects/:id`

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "clientId": "507f1f77bcf86cd799439012",
  "name": "E-commerce Platform",
  "description": "Full-stack e-commerce solution",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "membersCount": 5,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "client": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Tech Corp",
    "cnpj": "12.345.678/0001-90"
  }
}
```

**Errors:**
- `400` - Invalid ID format
- `404` - Project not found

---

### 3. Create Project
**POST** `/api/projects`

**Request Body:**
```json
{
  "clientId": "507f1f77bcf86cd799439012",
  "name": "E-commerce Platform",
  "description": "Full-stack e-commerce solution",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Response:** `201 Created`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "clientId": "507f1f77bcf86cd799439012",
  "name": "E-commerce Platform",
  "description": "Full-stack e-commerce solution",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "membersCount": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `400` - Validation errors, invalid dates, end date before start date
- `404` - Client not found

---

### 4. Update Project
**PUT** `/api/projects/:id`

**Request Body:** (all fields optional)
```json
{
  "name": "E-commerce Platform v2",
  "description": "Updated description",
  "startDate": "2024-01-15",
  "endDate": "2024-12-31"
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "clientId": "507f1f77bcf86cd799439012",
  "name": "E-commerce Platform v2",
  "description": "Updated description",
  "startDate": "2024-01-15T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "membersCount": 5,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-20T00:00:00.000Z"
}
```

**Errors:**
- `400` - Invalid ID, validation errors
- `404` - Project not found

---

### 5. Delete Project
**DELETE** `/api/projects/:id`

**Response:** `204 No Content`

**Note:** This will also delete all project members associated with this project.

**Errors:**
- `400` - Invalid ID format
- `404` - Project not found

---

## 👥 Project Members Endpoints

### 6. List Project Members
**GET** `/api/projects/:id/members`

**Response:** `200 OK`
```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "projectId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439014",
    "role": "Full Stack Developer",
    "isLeader": true,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": null,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "507f1f77bcf86cd799439014",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "project": {
      "id": "507f1f77bcf86cd799439011",
      "name": "E-commerce Platform",
      "description": "Full-stack e-commerce solution"
    }
  }
]
```

**Errors:**
- `400` - Invalid project ID
- `404` - Project not found

---

### 7. List Active Project Members
**GET** `/api/projects/:id/members/active`

**Response:** `200 OK`
```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "projectId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439014",
    "role": "Full Stack Developer",
    "isLeader": true,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": null,
    "isActive": true,
    "user": {
      "id": "507f1f77bcf86cd799439014",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

---

### 8. Get Project Member by ID
**GET** `/api/projects/:projectId/members/:memberId`

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439013",
  "projectId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439014",
  "role": "Full Stack Developer",
  "isLeader": true,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": null,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "507f1f77bcf86cd799439014",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "project": {
    "id": "507f1f77bcf86cd799439011",
    "name": "E-commerce Platform",
    "description": "Full-stack e-commerce solution"
  }
}
```

**Errors:**
- `400` - Invalid member ID
- `404` - Project member not found

---

### 9. Add Member to Project
**POST** `/api/projects/:id/members`

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439014",
  "role": "Full Stack Developer",
  "isLeader": false,
  "startDate": "2024-01-01",
  "endDate": null
}
```

**Response:** `201 Created`
```json
{
  "id": "507f1f77bcf86cd799439013",
  "projectId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439014",
  "role": "Full Stack Developer",
  "isLeader": false,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": null,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `400` - Validation errors, invalid dates, end date before start date
- `404` - Project or user not found
- `409` - User is already an active member of this project

**Note:** If `isLeader` is set to `true`, all other members will have their `isLeader` status set to `false`.

---

### 10. Update Project Member
**PUT** `/api/projects/:projectId/members/:memberId`

**Request Body:** (all fields optional)
```json
{
  "role": "Senior Full Stack Developer",
  "isLeader": true,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439013",
  "projectId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439014",
  "role": "Senior Full Stack Developer",
  "isLeader": true,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "isActive": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-20T00:00:00.000Z"
}
```

**Errors:**
- `400` - Invalid member ID, validation errors
- `404` - Project member not found

---

### 11. Remove Member from Project (Soft Delete)
**DELETE** `/api/projects/:projectId/members/:memberId`

**Response:** `204 No Content`

**Note:** This performs a soft delete by setting `endDate` to the current date. The member record is preserved for historical purposes.

**Errors:**
- `400` - Invalid member ID, member is already inactive
- `404` - Project member not found

---

## 📊 Business Rules

### Projects
1. **Project Creation**
   - Must be associated with an existing client
   - End date must be after start date
   - Project name is required (minimum 2 characters)

2. **Project Update**
   - Can change client association
   - End date must be after start date
   - All fields are optional

3. **Project Deletion**
   - Hard delete - permanently removes project
   - Automatically deletes all associated project members
   - Cannot be undone

### Project Members
1. **Adding Members**
   - User must exist in the system
   - User cannot be an active member of the same project twice
   - Only one leader per project (automatically manages leader status)
   - End date must be after start date

2. **Updating Members**
   - Can promote/demote leader status
   - Promoting a new leader automatically demotes the current leader
   - Can update role, dates, and leader status

3. **Removing Members**
   - Soft delete - sets endDate to current date
   - Preserves historical data
   - Cannot remove a member that is already inactive

---

## 🧪 Testing Examples

### Create a project
```bash
curl -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "clientId": "CLIENT_ID",
    "name": "E-commerce Platform",
    "description": "Full-stack solution",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }'
```

### List projects by client
```bash
curl -X GET "http://localhost:4000/api/projects?clientId=CLIENT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Add member to project
```bash
curl -X POST http://localhost:4000/api/projects/PROJECT_ID/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "USER_ID",
    "role": "Full Stack Developer",
    "isLeader": false,
    "startDate": "2024-01-01"
  }'
```

### Promote member to leader
```bash
curl -X PUT http://localhost:4000/api/projects/PROJECT_ID/members/MEMBER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "isLeader": true
  }'
```

### List active members
```bash
curl -X GET http://localhost:4000/api/projects/PROJECT_ID/members/active \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Remove member from project
```bash
curl -X DELETE http://localhost:4000/api/projects/PROJECT_ID/members/MEMBER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔄 Integration with Other Modules

### Related Endpoints:
- **Clients:** `/api/clients/:id` - Get client details for a project
- **Users:** `/api/users/:id` - Get user details for project members
- **TimeSheet:** `/api/timesheet?projectId=PROJECT_ID` - Time entries for a project

### Typical Workflow:
1. Create a client
2. Create project(s) for the client
3. Add team members to the project
4. Assign tasks/cards in Kanban
5. Track time in TimeSheet
6. Generate reports

---

## 📝 Notes

- All dates are stored and returned in ISO 8601 format
- `isActive` is calculated based on the presence of `endDate`
- Project leaders are automatically managed (only one per project)
- Soft deletes preserve historical data for reporting
- All endpoints require authentication
- Managers/admins have full access (to be implemented in authorization middleware)
