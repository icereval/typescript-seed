# Typescript Seed

## Requirements

- [Yarn](https://yarnpkg.com/lang/en/docs/install/#mac-tab)
- [NodeJS (NPM)](https://nodejs.org/en/)
- [Docker Client](https://www.docker.com/community-edition#/download)
- Developed with [Visual Studio Code](https://code.visualstudio.com/) _(optional)_

## Services

- `docker-compose up`
  - postgres

## Server

### Install and Run

- `yarn install`
- `npm start`

### Migrations

- `npm run migrate schema:sync`
- `npm run migrate migrations:create`
- `npm run migrate migrations:run`

### API

Local Server: http://localhost:5000/

Endpoint|Method|URI
--- | --- | ---
Login | `POST` | `/login`
Login | `DELETE` | `/logout`
Sign Up | `POST` | `/signup`
Show User Info | `GET` | `/users/{id}`
Show My User Info | `GET` | `/users/me`
Update My User Info | `PUT` | `/users/me`

## WebApp

- `yarn install`
- `npm start`

Local Server: http://localhost:3000/
