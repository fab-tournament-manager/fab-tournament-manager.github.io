# FAB Tournament Manager

Sistema em React + Firebase para gerenciamento de campeonatos de Flesh and Blood com três perfis.

## Perfis do sistema

- **Jogador**
  - cadastro público
  - login
  - edição de perfil
  - consulta do ranking geral
- **Loja**
  - login criado somente pelo administrador
  - edição de perfil do responsável
  - cadastro dos resultados finais dos torneios da própria loja
  - edição e exclusão apenas dos próprios resultados
- **Administrador**
  - poder total
  - criação de acessos de lojas
  - cadastro, edição e exclusão de qualquer resultado
  - visualização do ranking consolidado

## Regras de negócio implementadas

- não existem rodadas no projeto
- cada lançamento representa o **resultado final de um torneio**
- o ranking geral é consolidado por participante a partir de todos os resultados lançados
- somente o administrador cadastra lojas
- cada loja só pode manipular os resultados vinculados a ela

## Tecnologias

- React
- TypeScript
- Vite
- Firebase Authentication
- Cloud Firestore
- React Router

## Estrutura do banco

### Coleção `users`

```json
{
  "uid": "abc123",
  "name": "Raphael Saraiva",
  "nickname": "raph",
  "email": "raph@email.com",
  "favoriteDeck": "Katsu",
  "role": "player",
  "storeId": null,
  "storeName": null
}
```

Exemplo de loja

```json
{
  "uid": "storeUid123",
  "name": "Lucas Costa",
  "nickname": "lucas",
  "email": "loja@email.com",
  "favoriteDeck": "",
  "role": "store",
  "storeId": "arena-fortaleza",
  "storeName": "Arena Fortaleza"
}
```

### Coleção `tournament_results`

```json
{
  "playerName": "Raphael Saraiva",
  "playerNickname": "raph",
  "deck": "Katsu",
  "tournamentName": "Armory de Março",
  "eventDate": "2026-03-20",
  "score": 9,
  "wins": 3,
  "losses": 1,
  "draws": 0,
  "storeId": "arena-fortaleza",
  "storeName": "Arena Fortaleza",
  "createdBy": "storeUid123"
}
```

## Como configurar

### 1. Instale as dependências

```bash
npm install
```

### 2. Crie o arquivo `.env`

Copie o `.env.example` para `.env` e preencha com os dados do seu projeto Firebase.

```bash
cp .env.example .env
```

### 3. Ative no Firebase

No console do Firebase, habilite:

- Authentication com Email/Password
- Cloud Firestore

### 4. Regras do Firestore

Use o arquivo `firestore.rules` como base para proteger o banco.

## Como rodar

```bash
npm run dev
```

## Como criar o primeiro administrador

O cadastro público cria usuários com papel `player`.

Para transformar um usuário em admin, vá no documento dele em `users/{uid}` no Firestore e altere:

```json
{
  "role": "admin"
}
```

Depois disso, esse usuário poderá entrar na área administrativa e criar acessos das lojas.

## Observações importantes

- por uma limitação normal do Firebase Authentication no frontend, ao criar uma conta de loja usando a própria aplicação, a sessão atual é trocada para o novo usuário criado. Por isso, o fluxo ideal é criar a loja e depois fazer login novamente como administrador.
- em produção, o ideal é mover a criação de contas de lojas para uma Cloud Function ou backend com Firebase Admin SDK. Assim o administrador não perde a sessão.
- o projeto não inclui chaves reais do Firebase.
