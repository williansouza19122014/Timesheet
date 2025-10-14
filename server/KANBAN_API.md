# Kanban API Documentation

## Authentication
All endpoints require authentication (`Authorization: Bearer <token>`). Board and column management is restricted to users with role `ADMIN` or `MANAGER`. Card operations are available to project members (or higher roles).

---

## Boards

### List Boards
**GET** `/api/kanban/boards`

**Query Parameters**
- `projectId` *(optional)*: filter by project.
- `includeArchived` *(optional, boolean)*: include archived boards when `true`.

**Response** `200 OK`
```json
[
  {
    "id": "67a1f8d59fb3ab2bf15c1234",
    "projectId": "67a1f8d59fb3ab2bf15c1220",
    "name": "Projeto Alfa",
    "description": "Backlog e acompanhamento",
    "isArchived": false,
    "createdBy": "67a1f8089fb3ab2bf15c1111",
    "columns": [
      {
        "id": "67a1f9319fb3ab2bf15c5678",
        "boardId": "67a1f8d59fb3ab2bf15c1234",
        "title": "Backlog",
        "position": 0,
        "cards": [
          {
            "id": "67a1f9729fb3ab2bf15c7890",
            "boardId": "67a1f8d59fb3ab2bf15c1234",
            "columnId": "67a1f9319fb3ab2bf15c5678",
            "projectId": "67a1f8d59fb3ab2bf15c1220",
            "title": "Configurar ambiente",
            "description": "Infra inicial",
            "position": 0,
            "status": "todo",
            "tags": ["infra"],
            "dueDate": "2025-02-01T00:00:00.000Z",
            "priority": "medium",
            "assignees": ["67a1f8089fb3ab2bf15c1111"],
            "createdBy": "67a1f8089fb3ab2bf15c1111",
            "createdAt": "2025-02-01T12:00:00.000Z",
            "updatedAt": "2025-02-02T09:25:00.000Z"
          }
        ],
        "createdAt": "2025-02-01T11:00:00.000Z",
        "updatedAt": "2025-02-01T11:00:00.000Z"
      }
    ],
    "createdAt": "2025-02-01T11:00:00.000Z",
    "updatedAt": "2025-02-01T11:05:00.000Z"
  }
]
```

### Create Board *(ADMIN/MANAGER)*
**POST** `/api/kanban/boards`
```json
{
  "projectId": "67a1f8d59fb3ab2bf15c1220",
  "name": "Projeto Beta",
  "description": "Board de acompanhamento"
}
```

**Response** `201 Created` – board with default columns `Backlog`, `Em andamento`, `Concluido`.

### Update Board *(ADMIN/MANAGER)*
**PUT** `/api/kanban/boards/:boardId`
```json
{
  "name": "Projeto Beta - Sprint 1",
  "description": "Foco em MVP"
}
```

### Archive/Restore Board *(ADMIN/MANAGER)*
**POST** `/api/kanban/boards/:boardId/archive`
```json
{ "isArchived": true }
```

---

## Columns

### Create Column *(ADMIN/MANAGER)*
**POST** `/api/kanban/columns`
```json
{
  "boardId": "67a1f8d59fb3ab2bf15c1234",
  "title": "Em Revisão",
  "limit": 5
}
```

### Update Column *(ADMIN/MANAGER)*
**PUT** `/api/kanban/columns/:columnId`
```json
{
  "title": "Em teste",
  "limit": 4,
  "position": 2
}
```
- `position` reordena a coluna dentro do board.

### Delete Column *(ADMIN/MANAGER)*
**DELETE** `/api/kanban/columns/:columnId`
```json
{
  "moveCardsToColumnId": "67a1fa129fb3ab2bf15c9999"
}
```
- O campo é opcional; se omitido, a coluna deve estar vazia.

---

## Cards

### Create Card
**POST** `/api/kanban/cards`
```json
{
  "columnId": "67a1f9319fb3ab2bf15c5678",
  "title": "Implementar autenticação",
  "description": "Fluxo completo de login",
  "tags": ["auth", "backend"],
  "dueDate": "2025-02-15",
  "priority": "high",
  "assignees": ["67a1f8089fb3ab2bf15c1111"],
  "position": 1
}
```

### Update Card
**PUT** `/api/kanban/cards/:cardId`
```json
{
  "description": "Fluxo login + reset password",
  "status": "doing",
  "tags": "auth,backend",
  "priority": "medium"
}
```

### Move Card
**POST** `/api/kanban/cards/:cardId/move`
```json
{
  "targetColumnId": "67a1fa129fb3ab2bf15c9999",
  "targetPosition": 0
}
```

### Delete Card
**DELETE** `/api/kanban/cards/:cardId`

### List Card Activity
**GET** `/api/kanban/cards/:cardId/activity`

**Response** `200 OK`
```json
[
  {
    "id": "67a1fb2d9fb3ab2bf15ca321",
    "cardId": "67a1fa829fb3ab2bf15ca210",
    "userId": "67a1f8089fb3ab2bf15c1111",
    "action": "card_moved",
    "payload": {
      "fromColumnId": "67a1f9319fb3ab2bf15c5678",
      "toColumnId": "67a1fa129fb3ab2bf15c9999",
      "position": 0
    },
    "createdAt": "2025-02-02T09:45:00.000Z"
  }
]
```

---

## Validation Rules

- `projectId`, `boardId`, `columnId`, `cardId` devem ser ObjectIds válidos.
- Apenas usuários com role `ADMIN` ou `MANAGER` podem criar/editar boards e colunas.
- Cards só podem referenciar membros ativos do projeto na lista de `assignees`.
- `position` é um inteiro = 0; valores fora do intervalo são ajustados para o final da lista.
- Datas aceitam strings ISO ou `YYYY-MM-DD`.
- Campos de texto (nome, título, descrições) são sanitizados para remover espaços extras.
- Tags aceitam string única separada por vírgulas ou array de strings.

---

## Eventos de Atividade

Os principais eventos registrados para cada card:
- `card_created`
- `card_updated`
- `card_moved`
- `card_deleted`

Use `GET /api/kanban/cards/:cardId/activity` para auditar mudanças recentes.
