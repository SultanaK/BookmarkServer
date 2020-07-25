require('dotenv').config()
const knex = require('knex')
const BookmarksService = require('./bookmarks-service')

const knexInstance = knex({
  client: 'pg',
  connection: process.env.DB_URL,
})

BookmarksService.getAllBookmarks(knexInstance)
  .then(bookmarks => console.log(bookmarks))
  .then(() =>
    BookmarksService.insertBookmark(knexInstance, {
      title: 'New title',
      url: 'New content',
      discription: 'abc',
      rating:'5'
    })
  )
  .then(newBookmark => {
    console.log(newBookmark)
    return BookmarksService.updateBookmark(
      knexInstance,
      newBookmark.id,
      { title: 'Updated title' }
    ).then(() => BookmarksService.getById(knexInstance, newBookmark.id))
  })
  .then(bookmark => {
    console.log(bookmark)
    return BookmarksService.deleteBookmark(knexInstance, bookmark.id)
  })


