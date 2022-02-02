const path = require('path');
const { Seeder } = require('mongo-seeding');

const db = require("../models");

const config = {
    database: db.connString,
    dropDatabase: true,
  };
const seeder = new Seeder(config);
const collections = seeder.readCollectionsFromPath(
  path.resolve('./data'),
  {
    transformers: [Seeder.Transformers.replaceDocumentIdWithUnderscoreId],
  },
);

seeder
  .import(collections)
  .then(() => {
    console.log('Success');
  })
  .catch(err => {
    console.log('Error', err);
  });