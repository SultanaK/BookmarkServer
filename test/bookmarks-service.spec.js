const BookmarksService = require('../src/bookmarks-service')
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

  /* describe(`getAllArticles()`, () => { */
  context(`Given 'bookmarks_new' table has data`, () => {
    beforeEach(() => {
      return db
        .into('bookmarks_list')
        .insert(testBookmarks)
    })
    /* it(`resolves all articles from 'blogful_articles' table`, () => { */
    it(`getAllBookmarks() resolves all articles from 'bookmarks_new' table`, () => {
      // test that ArticlesService.getAllArticles gets data from table
      return BookmarksService.getAllBookmarks(db)
        .then(actual => {
          expect(actual).to.eql(testBookmarks)

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
  /* it(`insertArticle() inserts a new article and resolves the new article with an 'id'`, () => {
    const newBookmark = {
      id,
      title,
      url,
      description,
      rating,
  } 
    return BookmarksService.insertBookmark(db, newBookmark)
      .then(actual => {
      expect(actual).to.eql({
        id: 1,
        title: 'Code-Academy',
        url:'http://codeacadamy.com',
        description: 'coding school',
        rating: '4',
      })
    }) 
   }) */
  it(`getById() resolves an article by id from 'bookmarks_list' table`, () => {
    const expectedBookmarkId =3 
    const expectedBookmark = testBookmarks.find(a => a.id === expectedBookmarkId);
    /* const thirdTestBookmark = testBookmarks[thirdId - 1] */
    return BookmarksService.getById(db, expectedBookmarkId)
      .then(actual => {
        expect(actual).to.eql(expectedBookmark)
          /* id: thirdId,
          title: thirdTestBookmark.title,
          url: thirdTestBookmark.url,
          description: thirdTestBookmark.content,
          rating: thirdTestBookmark.rating, */
      
      })
    /* return supertest(app)
        .get(`/bookmarkss/${thirdId}`)
        .expect(200, expectedBookmark)
    }) */
  })
  it(`deleteArticle() removes an article by id from 'blogful_articles' table`, () => {
     const bookmarkId = 3
     return BookmarksService.deleteBookmark(db, bookmarkId)
       .then(() => BookmarksService.getAllBookmarks(db))
       .then(allBookmarks => {
         // copy the test articles array without the "deleted" article
         const expected = testBookmarks.filter(bookmark => bookmark.id !== bookmarkId)
         expect(allBookmarks).to.eql(expected)
       })
   })
   it(`updateArticle() updates an article from the 'blogful_articles' table`, () => {
    const idOfBookmarkToUpdate = 3
     const newBookmarkData = {
       title: 'MDN',
       url: 'https://www.mdn.org',
       description: 'good information to learn',
     }
     return BookmarksService.updateBookmark(db, idOfBookmarkToUpdate, newBookmarkData)
       .then(() => BookmarksService.getById(db, idOfBookmarkToUpdate))
       .then(bookmark => {
         expect(bookmark).to.eql(expected)
       })
   })

})
  


