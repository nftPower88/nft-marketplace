# Backend

## Run DB container

To run the backend:

`cd backend`

`sudo docker-compose up --build` || `sudo docker-compose up -d`

This will start mongodb and express-app:

## Seed Database

Populate the db (users table) by running:

`cd seed`

`node seeder.js`

## Run backend app

Install dependencies

`yarn install`

Run:

`yarn dev` || `yarn start`

## Seed markerplace backend container

To seed database for now you have to sh to express running container and run the command file:

`sudo docker ps `

Will show you the running container
copy the desired (express-app) docker ID shown to screen, then sh:

`sudo docker exec  -it marketplace_db /bin/sh`

`sudo docker exec -w /seed marketplace_db sh -c "node seeder.js"`
 
