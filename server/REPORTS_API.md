# Reports API Documentation

## Authentication
All endpoints require JWT authentication. Users with role `ADMIN` or `MANAGER` podem visualizar dados globais. Demais usu�rios enxergam apenas informa��es relacionadas a si mesmos (exceto quando explicitado por filtros permitidos).

---

## 1. Time Summary
**GET** `/api/reports/time-summary`

**Query Parameters**
- `projectId` *(opcional)*: Filtra resultados por projeto.
- `userId` *(opcional)*: Requer role `ADMIN`/`MANAGER` para consultar outro usu�rio.
- `startDate` e `endDate` *(opcionais)*: Limita o per�odo (ISO ou `YYYY-MM-DD`).

**Response** `200 OK`
```json
{
  "range": {
    "startDate": "2025-02-01",
    "endDate": "2025-02-15"
  },
  "totalHours": 128,
  "totalEntries": 42,
  "byUser": [
    {
      "userId": "67a1f8089fb3ab2bf15c1111",
      "name": "Willian Souza",
      "email": "willian@example.com",
      "totalHours": 64,
      "totalEntries": 20
    }
  ],
  "byProject": [
    {
      "projectId": "67a1f8d59fb3ab2bf15c1220",
      "name": "Portal Corporativo",
      "totalHours": 80
    }
  ],
  "byDay": [
    {
      "date": "2025-02-03",
      "totalHours": 16,
      "totalEntries": 4
    }
  ]
}
```

---

## 2. Project Performance
**GET** `/api/reports/project-performance`

**Query Parameters**
- `startDate`, `endDate` *(opcionais)*: delimitam a janela de an�lise.
- `onlyActive` *(boolean)*: retorna somente projetos sem data de encerramento ou ainda vigentes.

**Response** `200 OK`
```json
{
  "projects": [
    {
      "projectId": "67a1f8d59fb3ab2bf15c1220",
      "name": "Portal Corporativo",
      "clientName": "Tech Corp",
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": null,
      "isActive": true,
      "totalMembers": 7,
      "activeMembers": 6,
      "totalHours": 120,
      "avgHoursPerMember": 20
    }
  ]
}
```

---

## 3. Vacation Summary
**GET** `/api/reports/vacation-summary`

**Query Parameters**
- `startDate`, `endDate` *(opcionais)*: filtram pelo intervalo das f�rias (campo `startDate`).
- `status` *(opcional)*: um dos `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`.

**Response** `200 OK`
```json
{
  "range": {
    "startDate": "2025-01-01",
    "endDate": "2025-03-31"
  },
  "totalRequests": 8,
  "totalDaysTaken": 46,
  "byStatus": [
    { "status": "APPROVED", "totalRequests": 5, "totalDays": 30 },
    { "status": "PENDING", "totalRequests": 2, "totalDays": 10 }
  ],
  "byUser": [
    {
      "userId": "67a1f8089fb3ab2bf15c1111",
      "name": "Willian Souza",
      "email": "willian@example.com",
      "totalRequests": 3,
      "totalDays": 18
    }
  ]
}
```

---

## 4. User Workload
**GET** `/api/reports/user-workload`

**Query Parameters**
- `projectId` *(opcional)*: limita a an�lise a um projeto.
- `userId` *(opcional)*: requer role `ADMIN`/`MANAGER`.
- `startDate`, `endDate` *(opcionais)*: recorte do per�odo.

**Response** `200 OK`
```json
{
  "range": {
    "startDate": "2025-02-01",
    "endDate": "2025-02-28"
  },
  "users": [
    {
      "userId": "67a1f8089fb3ab2bf15c1111",
      "name": "Willian Souza",
      "email": "willian@example.com",
      "totalHours": 64,
      "projects": [
        { "projectId": "67a1f8d59fb3ab2bf15c1220", "totalHours": 40 },
        { "projectId": "67a1fa129fb3ab2bf15c9999", "totalHours": 24 }
      ]
    }
  ]
}
```

---

## Permiss�es & Notas
- **Gestores/Admins** t�m acesso global aos relat�rios; colaboradores visualizam apenas dados pr�prios, exceto quando vinculados a projetos espec�ficos nos quais participam.
- `hours` s�o somat�rios baseados nas aloca��es de ponto (`TimeEntryAllocations`). Quando n�o h� aloca��o, o registro conta com 0 horas.
- Filtros de data aceitam formatos ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`) ou apenas `YYYY-MM-DD`.
- Para performance de projetos, campos como `avgHoursPerMember` retornam `0` quando n�o h� membros ativos.
- `user-workload` ignora cards/horas sem projeto associado nas listas de projetos.
