# Users API Documentation

## Authentication
All endpoints require authentication. Include JWT token in `Authorization` header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. List Users
**GET** `/api/users`

**Query parameters** (optional):
- `status`: `ACTIVE` | `INACTIVE`
- `role`: `ADMIN` | `MANAGER` | `EMPLOYEE`
- `search`: Matches name or email (case-insensitive)
- `clientId`: Filter users linked to a client id
- `projectId`: Filter users linked to a project id

**Response** `200 OK`
```json
[
  {
    "id": "665b7e0c6f1f2a1edc2e1d10",
    "name": "Willian Souza",
    "email": "willian@example.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "photo": "https://cdn.example.com/profile/willian.png",
    "hireDate": "2024-01-05T00:00:00.000Z",
    "terminationDate": null,
    "cpf": "12345678901",
    "birthDate": "1994-08-12T00:00:00.000Z",
    "phone": "+55 11 99999-0000",
    "position": "Engineering Manager",
    "department": "Technology",
    "contractType": "CLT",
    "workSchedule": {
      "startTime": "09:00",
      "endTime": "18:00"
    },
    "address": {
      "street": "Av. Paulista",
      "number": "1578",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01310-200"
    },
    "managerId": null,
    "manager": null,
    "selectedClients": [
      "665b7dfc6f1f2a1edc2e1c90"
    ],
    "selectedProjects": [
      "665b7dfc6f1f2a1edc2e1c95"
    ],
    "personalInfo": {
      "nationality": "Brasileira",
      "maritalStatus": "Casado",
      "educationLevel": "Pós-graduação",
      "emergencyContact": {
        "name": "Maria Souza",
        "phone": "+55 11 95555-0000",
        "relationship": "Esposa"
      }
    },
    "bankInfo": {
      "bankName": "Banco Inter",
      "accountType": "Corrente",
      "accountNumber": "123456-7",
      "agency": "0001"
    },
    "additionalNotes": "Acesso completo ao sistema.",
    "workStartTime": "09:00",
    "workEndTime": "18:00",
    "createdAt": "2024-05-31T20:18:20.000Z",
    "updatedAt": "2024-06-01T13:42:14.000Z"
  }
]
```

**Nested Collections**
- `documents`: registros de documentos pessoais (tipo, emissor, validade, links).
- `benefits`: beneficios concedidos ao colaborador (provedor, status, contribuicao).
- `dependents`: dependentes cadastrados para fins de beneficios.
- `employmentHistory`: historico profissional anterior com responsabilidades e tecnologias.
- `skills`: habilidades e certificacoes relevantes.

---

### 2. Get User by ID
**GET** `/api/users/:id`

**Response** `200 OK` (same shape as list item)

**Errors**
- `400` Invalid user id
- `404` User not found

---

### 3. Create User
**POST** `/api/users`

**Body**
```json
{
  "name": "Fernanda Lima",
  "email": "fernanda@example.com",
  "password": "Secret123",
  "role": "MANAGER",
  "status": "ACTIVE",
  "phone": "+55 21 98888-1111",
  "hireDate": "2024-03-01",
  "workSchedule": { "startTime": "08:30", "endTime": "17:30" },
  "personalInfo": {
    "nationality": "Brasileira",
    "emergencyContact": {
      "name": "Rafael Silva",
      "phone": "+55 21 97777-2222",
      "relationship": "Irmão"
    }
  },
  "selectedClients": ["665b7dfc6f1f2a1edc2e1c90"],
  "selectedProjects": [],
  "managerId": "665b7e0c6f1f2a1edc2e1d10",
  "documents": [
    {
      "type": "RG",
      "number": "22.333.444-5",
      "issueDate": "2012-08-01",
      "issuer": "SSP-SP"
    }
  ],
  "benefits": [
    {
      "name": "Plano Saude",
      "provider": "Unimed",
      "joinDate": "2024-03-01"
    }
  ],
  "dependents": [],
  "employmentHistory": [],
  "skills": [
    {
      "name": "React",
      "level": "avancado"
    }
  ]

**Response** `201 Created`
```json
{
  "id": "665b7f146f1f2a1edc2e1d80",
  "name": "Fernanda Lima",
  "email": "fernanda@example.com",
  "role": "MANAGER",
  "status": "ACTIVE",
  "phone": "+55 21 98888-1111",
  "managerId": "665b7e0c6f1f2a1edc2e1d10",
  "selectedClients": ["665b7dfc6f1f2a1edc2e1c90"],
  "selectedProjects": [],
  "createdAt": "2024-06-01T15:02:10.000Z",
  "updatedAt": "2024-06-01T15:02:10.000Z"
  // remaining optional fields follow same pattern as list response
}
```

**Validations**
- `name` minimum 2 characters
- `password` minimum 6 characters
- `email` must be unique
- `managerId`, `selectedClients`, `selectedProjects` must reference existing records
- `cpf` must contain 11 digits (only numbers)
- Date fields must be valid ISO-parsable strings

**Errors**
- `400` Validation error / invalid references / invalid date
- `409` Email already registered
- `404` Manager, client or project not found

---

### 4. Update User
**PUT** `/api/users/:id`

**Body** (all fields optional; send `null` to clear an attribute)
```json
{
  "phone": null,
  "status": "INACTIVE",
  "terminationDate": "2024-12-31",
  "selectedProjects": [],
  "bankInfo": {
    "bankName": "Nubank",
    "accountNumber": "9988776-5"
  }
}
```

**Response** `200 OK` (updated user payload)

**Errors**
- `400` Invalid user id / validation errors
- `404` User not found / related resource not found
- `409` Email already registered by another user

---

### 5. Deactivate User
**DELETE** `/api/users/:id`

Soft-deactivates the user by setting `status` to `INACTIVE` and stamping `terminationDate` if it was empty.

**Response** `204 No Content`

**Errors**
- `400` Invalid user id
- `404` User not found

---

## Data Notes

- All date fields are returned in ISO 8601 format.
- Optional fields are omitted when empty/null, except arrays (default empty list).
- Nested objects (`address`, `workSchedule`, `personalInfo`, `bankInfo`) follow the same structure in requests and responses.
- Send arrays as empty lists to remove existing relations; send `null` for nested objects to clear them.

## Examples

### Filter by role and status
```
GET /api/users?role=MANAGER&status=ACTIVE
```

### Search by name/email
```
GET /api/users?search=fernanda
```

### Assign manager and clients
```
PUT /api/users/665b7f146f1f2a1edc2e1d80
{
  "managerId": "665b7e0c6f1f2a1edc2e1d10",
  "selectedClients": ["665b7dfc6f1f2a1edc2e1c90", "665b7dfc6f1f2a1edc2e1c95"]
}
```

---

## Error Format
All errors follow the standard format:
```json
{
  "message": "Description of the problem"
}
```
Additional `details` may be returned for validation issues.



