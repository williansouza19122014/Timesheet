# 📝 Vacation API Documentation

## 🔐 Authentication
All endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📅 Vacation Periods Endpoints

### 1. List Vacation Periods
**GET** `/api/vacations/periods`

**Query Parameters:**
- `userId` (optional) - Filter by user ID
- `startDate` (optional) - Filter by start date (ISO format)
- `endDate` (optional) - Filter by end date (ISO format)

**Response:** `200 OK`
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "daysAvailable": 30,
    "contractType": "CLT",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

---

### 2. Get Vacation Period by ID
**GET** `/api/vacations/periods/:id`

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "daysAvailable": 30,
  "contractType": "CLT",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:**
- `400` - Invalid ID format
- `404` - Vacation period not found

---

### 3. Create Vacation Period
**POST** `/api/vacations/periods`

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "daysAvailable": 30,
  "contractType": "CLT"
}
```

**Response:** `201 Created`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "daysAvailable": 30,
  "contractType": "CLT",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `400` - Validation errors, invalid dates, end date before start date
- `404` - User not found
- `409` - Overlapping vacation period already exists

---

### 4. Update Vacation Period
**PUT** `/api/vacations/periods/:id`

**Request Body:** (all fields optional)
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "daysAvailable": 30,
  "contractType": "CLT"
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "daysAvailable": 30,
  "contractType": "CLT",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `400` - Invalid ID, validation errors
- `404` - Vacation period not found

---

### 5. Delete Vacation Period
**DELETE** `/api/vacations/periods/:id`

**Response:** `204 No Content`

**Errors:**
- `400` - Invalid ID format
- `404` - Vacation period not found
- `409` - Cannot delete period with associated requests

---

## 📝 Vacation Requests Endpoints

### 6. List Vacation Requests
**GET** `/api/vacations/requests`

**Query Parameters:**
- `userId` (optional) - Filter by user ID
- `status` (optional) - Filter by status (PENDING, APPROVED, REJECTED, CANCELLED)
- `vacationPeriodId` (optional) - Filter by vacation period ID

**Response:** `200 OK`
```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439012",
    "vacationPeriodId": "507f1f77bcf86cd799439011",
    "startDate": "2024-07-01T00:00:00.000Z",
    "endDate": "2024-07-15T00:00:00.000Z",
    "daysTaken": 10,
    "soldDays": 5,
    "status": "PENDING",
    "comments": "Summer vacation",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z",
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "vacationPeriod": {
      "id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.999Z",
      "daysAvailable": 30,
      "contractType": "CLT"
    }
  }
]
```

---

### 7. Get Vacation Request by ID
**GET** `/api/vacations/requests/:id`

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439012",
  "vacationPeriodId": "507f1f77bcf86cd799439011",
  "startDate": "2024-07-01T00:00:00.000Z",
  "endDate": "2024-07-15T00:00:00.000Z",
  "daysTaken": 10,
  "soldDays": 5,
  "status": "PENDING",
  "comments": "Summer vacation",
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "vacationPeriod": {
    "id": "507f1f77bcf86cd799439011",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "daysAvailable": 30,
    "contractType": "CLT"
  }
}
```

**Errors:**
- `400` - Invalid ID format
- `404` - Vacation request not found

---

### 8. Create Vacation Request
**POST** `/api/vacations/requests`

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "vacationPeriodId": "507f1f77bcf86cd799439011",
  "startDate": "2024-07-01",
  "endDate": "2024-07-15",
  "daysTaken": 10,
  "soldDays": 5,
  "comments": "Summer vacation"
}
```

**Response:** `201 Created`
```json
{
  "id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439012",
  "vacationPeriodId": "507f1f77bcf86cd799439011",
  "startDate": "2024-07-01T00:00:00.000Z",
  "endDate": "2024-07-15T00:00:00.000Z",
  "daysTaken": 10,
  "soldDays": 5,
  "status": "PENDING",
  "comments": "Summer vacation",
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

**Errors:**
- `400` - Validation errors, insufficient vacation days, invalid dates
- `403` - User can only request vacations from their own periods
- `404` - User or vacation period not found

---

### 9. Update Vacation Request
**PUT** `/api/vacations/requests/:id`

**Request Body:** (all fields optional)
```json
{
  "startDate": "2024-07-01",
  "endDate": "2024-07-15",
  "daysTaken": 12,
  "soldDays": 3,
  "status": "APPROVED",
  "comments": "Approved by manager"
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439012",
  "vacationPeriodId": "507f1f77bcf86cd799439011",
  "startDate": "2024-07-01T00:00:00.000Z",
  "endDate": "2024-07-15T00:00:00.000Z",
  "daysTaken": 12,
  "soldDays": 3,
  "status": "APPROVED",
  "comments": "Approved by manager",
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-01-16T00:00:00.000Z"
}
```

**Errors:**
- `400` - Invalid ID, validation errors, cannot update cancelled/rejected requests
- `404` - Vacation request not found

---

### 10. Cancel Vacation Request
**POST** `/api/vacations/requests/:id/cancel`

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439012",
  "vacationPeriodId": "507f1f77bcf86cd799439011",
  "startDate": "2024-07-01T00:00:00.000Z",
  "endDate": "2024-07-15T00:00:00.000Z",
  "daysTaken": 10,
  "soldDays": 5,
  "status": "CANCELLED",
  "comments": "Summer vacation",
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-01-20T00:00:00.000Z"
}
```

**Errors:**
- `400` - Invalid ID, request already cancelled
- `404` - Vacation request not found

---

### 11. Delete Vacation Request
**DELETE** `/api/vacations/requests/:id`

**Response:** `204 No Content`

**Errors:**
- `400` - Invalid ID format
- `404` - Vacation request not found

---

## 📊 Status Values

Vacation requests can have the following statuses:
- `PENDING` - Awaiting approval
- `APPROVED` - Approved by manager/admin
- `REJECTED` - Rejected by manager/admin
- `CANCELLED` - Cancelled by user

---

## ⚠️ Business Rules

1. **Vacation Period Creation**
   - Cannot overlap with existing periods for the same user
   - End date must be after start date
   - User must exist in the system

2. **Vacation Request Creation**
   - User can only request vacations from their own periods
   - Cannot request more days than available in the period
   - Takes into account pending and approved requests
   - Start date must be before end date

3. **Vacation Request Update**
   - Cannot update cancelled or rejected requests
   - Status can be changed by authorized users (managers/admins)

4. **Vacation Period Deletion**
   - Cannot delete a period that has associated vacation requests
   - Must delete all requests first

---

## 🧪 Testing Examples

### Create a vacation period
```bash
curl -X POST http://localhost:4000/api/vacations/periods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "USER_ID",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "daysAvailable": 30,
    "contractType": "CLT"
  }'
```

### Create a vacation request
```bash
curl -X POST http://localhost:4000/api/vacations/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "USER_ID",
    "vacationPeriodId": "PERIOD_ID",
    "startDate": "2024-07-01",
    "endDate": "2024-07-15",
    "daysTaken": 10,
    "soldDays": 5,
    "comments": "Summer vacation"
  }'
```

### Approve a vacation request (manager/admin)
```bash
curl -X PUT http://localhost:4000/api/vacations/requests/REQUEST_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "APPROVED",
    "comments": "Approved - enjoy your vacation!"
  }'
```
