# DecideApp

Aplicação web para tomar decisões em grupo, com sistema de amizades, grupos e votações.

## Stack

- **Backend:** FastAPI (Python)
- **Frontend:** JavaScript Vanilla
- **Base de dados:** SQL (via SQLAlchemy)

---

## Funcionalidades

### Autenticação
- Registo de conta
- Login com sessão

### Amizades
- Pesquisar utilizadores
- Enviar pedido de amizade
- Aceitar ou recusar pedidos recebidos
- Cancelar pedidos enviados
- Remover amigos

### Grupos
- Criar grupos
- Convidar amigos para grupos
- Gerir membros

### Decisões
- Criar uma decisão com título e opções
- Partilhar com amigos ou grupo
- Votar numa opção
- Ver resultados em tempo real

---

## Estrutura do Projeto

```
votesync/

    ├── main.py              
    ├── models.py          
    ├── database.py    
    ├── schemas.py
    ├── utils.py       
    ├── routers/
        ├── auth.py           
        ├── friendships.py    
        ├── groups.py         
        ├── users.py         
        ├── decisions.py
        ├── members.py
        ├── options.py           
        ├── groups.py         
        └── votes.py     
└── frontend/
│   ├── HTML
│   │   ├── admin.html
│   │   ├── dashboard.html
│   │   ├── decisionMaking.html
│   │   ├── decisions.html
│   │   ├── friends.html
│   │   ├── groups.html
│   │   ├── index.html
│   │   ├── login.html
│   │   └── register.html
│   ├── IMG
│   │   ├── Login.png
│   │   ├── Logout.png
│   │   ├── trash.png
│   │   └── votesync_logo.html
│   ├── JS
│   │   ├── admin.js
│   │   ├── Api.js
│   │   ├── dashboard.js
│   │   ├── decisionMaking.js
│   │   ├── decisions.js
│   │   ├── friends.js
│   │   ├── friendSearch.js
│   │   ├── groups.js
│   │   ├── index.js
│   │   ├── login.js
│   │   └── register.js
│   └── Styles
│       ├── admin.css
│       ├── dashboard.css
│       ├── decisionMaking.css
│       ├── decisions.css
│       ├── friends.css
│       ├── groups.css
│       └── index.css
│
...




```

---

## Instalação e Execução

Abrir o docker
Abrir o container 
```bash
make create-db
make all
```

Aceder em: `http://localhost:8000`

Documentação automática da API: `http://localhost:8000/docs`