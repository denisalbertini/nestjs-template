# Description

Template NestJS project based on the Docked Bike Sharing System API. Full version available at [this repository](https://github.com./denis-albertini/docked-bike-sharing-system-api).

## Pre-requisites

- Node.js (18 or superior)
- npm (comes with Node.js)
- PostgreSQL (17 or superior [can be replaced by other relational databases])

## Instalation

```bash
$ git clone https://github.com./denis-albertini/docked-bike-sharing-system-api-nestjs.git
$ cd docked-bike-sharing-system-api-nestjs
$ npm i
```

## Project setup

Create a .env file and write the following variables:

```ini
POSTGRES_CONNECTION_URI=your_connection_url
# can be generated with openssl rand
JWT_SECRET=your_secret_key
SMTP_HOST=smtp_server_hostname
SMTP_USER=email_address
# might differ from the actual email password
SMTP_PASS=password_for_smtp_auth

# optional variables
SMTP_PORT=smtp_server_port
DOMAIN=your_app_domain
```

## Usefull scripts

```bash
# start the server
# will create the database schema
$ npm start

# watch mode(for development)
$ npm run dev

# unit tests
$ npm test

# e2e tests
$ npm run test:e2e

# generate a migration
$ npm run migration:generate
```

## Replacing the database

To replace the database you have to **write a new environment variable with the desired connection url** and update the `src/config/database.config.ts` file by changing the `type` and `url` properties of the `dataSourceOptions` constant.
