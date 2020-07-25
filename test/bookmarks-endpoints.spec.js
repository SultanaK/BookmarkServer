const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')


describe.only('Bookmarks Endpoints', function () {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)

    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('bookmarks_list').truncate())
    context('Given there are articles in the database', () => {
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
        
        beforeEach('insert articles', () => {
                  return db
                        .into('bookmark_list')
                        .insert(testBookmarks)
                    })
    })
    it('GET /articles responds with 200 and all of the articles', () => {
            return supertest(app)
                  .get('/bookmarks')
                  .expect(200, testBookmarks)
                  // TODO: add more assertions about the body
    })
    it('GET /articles/:article_id responds with 200 and the specified article', () => {
            const bookmarkId = 2
                const expectedBookmark = testBookmarks[bookmarkId - 1]
                    return supertest(app)
                          .get(`/bookmarks/${bookmarkId}`)
                          .expect(200, expectedBookmark)
                      })




})
