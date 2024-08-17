# Mangarida API

Mangarida API provides an easy/decluttered way for accessing/wrapping the `api.comick.fun` API.

## API Reference

#### Search for a comic

```http
  GET /search
```

| Parameter | Type     | Description                | Required                |
| :-------- | :------- | :------------------------- | :------------------------- |
| `query` | `string` | Your search query. | ✅                      |

#### Get comic details

```http
  GET /manga/${mangaId}
```

| Parameter | Type     | Description                | Required                |
| :-------- | :------- | :------------------------- | :------------------------- |
| `mangaId` | `string` | Id of comic to fetch. | ✅                      |

#### Get trending

```http
  GET /trending
```

| Parameter | Type     | Description                | Required                |
| :-------- | :------- | :------------------------- | :------------------------- |
| `none` | `none` | Id of comic to fetch. | ✅                      |

#### Get all chapters for a comic

```http
  GET /chapters/${mangaId}
```

#### Get pages for a chapter

```http
  GET /read/${chapterId}
```

| Parameter | Type     | Description                | Required                |
| :-------- | :------- | :------------------------- | :------------------------- |
| `chapterId` | `string` | Id of chapter to fetch pages for. | ✅                      |


## Run Locally

#### Clone the project

```bash
  git clone https://github.com/vo1x/api.mangarida.vercel.app.git
```

#### Go to the project directory

```bash
  cd api.mangarida.vercel.app/
```

#### Install dependencies and run the development server

##### **Node**
```bash
  npm install
  npm run dev
```

##### **Bun**
```bash
  bun install
  bun run dev
```
