const BookmarksService = require('../src/bookmarks/bookmarks-service')
const knex = require('knex')

describe(`Bookmarks service object`, function () {
  let db
  let testBookmarks = [
    {
      id: 1,
      title: 'Thinkful',
      url: 'https://www.thinkful.com',
      description: 'Think outside the classroom',
      rating: '5',
    },
    {
      id: 2,
      title: 'Google',
      url: 'https://www.google.com',
      description: 'Where we find everything else',
      rating: '4',
    },
    {
      id: 3,
      title: 'MDN',
      url: 'https://developer.mozilla.org',
      description: 'The only place to find web documentation',
      rating: '5',
    },
  ]

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
  })
  before(() => {
    return db
      .into('bookmarks_list')
      .insert(testBookmarks)
  })
  before(() => db('bookmarks_list').truncate())
  afterEach(() => db('bookmarks_list').truncate())

  after(() => db.destroy())

  /* describe(`getAllbookmarks()`, () => { */
  context(`Given 'bookmarks_new' table has data`, () => {
    beforeEach(() => {
      return db
        .into('bookmarks_list')
        .insert(testBookmarks)
    })
    /* it(`resolves all bookmarks from 'blogful_bookmarks' table`, () => { */
    it(`getAllBookmarks() resolves all bookmarks from 'bookmarks_new' table`, () => {
      // test that bookmarksService.getAllbookmarks gets data from table
      return BookmarksService.getAllBookmarks(db)
        .then(actual => {
          expect(actual).to.eql(testBookmarks)

        })

    })
    it(`getById() resolves an bookmark by id from 'bookmarks_list' table`, () => {
      const expectedBookmarkId = 1
      const expectedBookmark = testBookmarks.find(a => a.id === expectedBookmarkId);
      console.log(expectedBookmarkId);
      /* const thirdTestBookmark = testBookmarks[thirdId - 1] */
      return BookmarksService.getById(db, expectedBookmarkId)
        .then(actual => {
          console.log(actual)
          expect(actual).to.eql(expectedBookmark)
        })

    })
    it(`deletebookmark() removes an bookmark by id from 'blogful_bookmarks' table`, () => {
      const bookmarkId = 3
      return BookmarksService.deleteBookmark(db, bookmarkId)
        .then(() => BookmarksService.getAllBookmarks(db))
        .then(allBookmarks => {
          // copy the test bookmarks array without the "deleted" bookmark
          const expected = testBookmarks.filter(bookmark => bookmark.id !== bookmarkId)
          expect(allBookmarks).to.eql(expected)
        })
    })
    it(`updatebookmark() updates an bookmark from the 'blogful_bookmarks' table`, () => {
      const idOfBookmarkToUpdate = 5
      const newBookmarkData = {
        title: 'MDN',
        url: 'https://www.mdn.org',
        description: 'good information to learn',
      }
      return BookmarksService.updateBookmark(db, idOfBookmarkToUpdate, newBookmarkData)
        .then(() => BookmarksService.getById(db, idOfBookmarkToUpdate))
        .then(bookmark => {
          console.log(newBookmarkData)
          expect(bookmark).to.eql({
            id: idOfBookmarkToUpdate,
            ...newBookmarkData,
          })
        })
    })
  })
  context(`Given 'bookmarks_list' has no data`, () => {
    it(`getBookmarks() resolves an empty array`, () => {
      return BookmarksService.getAllBookmarks(db)
        .then(actual => {
          expect(actual).to.eql([])
        })
    })
  })
  it(`insertbookmark() inserts a new bookmark and resolves the new bookmark with an 'id'`, () => {
    const newBookmark = {
      id: 1,
      title: 'Code-Academy',
      url: 'http://codeacadamy.com',
      description: 'coding school',
      rating: '4',
    }
    return BookmarksService.insertBookmark(db, newBookmark)
      .then(actual => {
        expect(actual).to.eql({
          id: 1,
          title: 'Code-Academy',
          url: 'http://codeacadamy.com',
          description: 'coding school',
          rating: '4',
        })
      })

  })



})



