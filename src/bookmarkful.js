require('dotenv').config()
const knex = require('knex')
const BookmarksService = require('./bookmarks-service')

const knexInstance = knex({
  client: 'pg',
  connection: process.env.DB_URL,
})

console.log(BookmarksService.getAllBookmarks(knex))
