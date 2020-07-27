const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray, makeMaliciousBookmark } = require('./bookmarks.fixtures')

describe('Bookmarks Endpoints', function () {
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

    afterEach('cleanup', () => db('bookmarks_list').truncate())

    describe(`GET /api/bookmarks`, () => {
        context(`Given no Bookmarks`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/bookmarks')
                    .expect(200, [])
            })
        })

        context('Given there are Bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert Bookmarks', () => {
                return db
                    .into('bookmarks_list')
                    .insert(testBookmarks)
            })

            it('responds with 200 and all of the Bookmarks', () => {
                return supertest(app)
                    .get('/api/bookmarks')
                    .expect(200, testBookmarks)
            })
        })

        context(`Given an XSS attack Bookmark`, () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()

            beforeEach('insert malicious Bookmark', () => {
                return db
                    .into('bookmarks_list')
                    .insert([maliciousBookmark])
            })

            it('removes XSS attack description', () => {
                return supertest(app)
                    .get(`/api/bookmarks`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].title).to.eql(expectedBookmark.title)
                        expect(res.body[0].description).to.eql(expectedBookmark.description)
                    })
            })
        })
    })

    describe(`GET /api/bookmarks/:bookmark_id`, () => {
        context(`Given no Bookmarks`, () => {
            it(`responds with 404`, () => {
                const BookmarkId = 123456
                return supertest(app)
                    .get(`/api/bookmarks/${BookmarkId}`)
                    .expect(404, { error: { message: `Bookmark doesn't exist` } })
            })
        })

        context('Given there are Bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert Bookmarks', () => {
                return db
                    .into('bookmarks_list')
                    .insert(testBookmarks)
            })

            it('responds with 200 and the specified Bookmark', () => {
                const BookmarkId = 2
                const expectedBookmark = testBookmarks[BookmarkId - 1]
                return supertest(app)
                    .get(`/api/bookmarks/${BookmarkId}`)
                    .expect(200, expectedBookmark)
            })
        })

        context(`Given an XSS attack Bookmark`, () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()

            beforeEach('insert malicious Bookmark', () => {
                return db
                    .into('bookmarks_list')
                    .insert([maliciousBookmark])
            })

            it('removes XSS attack description', () => {
                return supertest(app)
                    .get(`/api/bookmarks/${maliciousBookmark.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.title).to.eql(expectedBookmark.title)
                        expect(res.body.description).to.eql(expectedBookmark.description)
                    })
            })
        })
    })

    describe(`POST /api/bookmarks`, () => {
        it(`creates an Bookmark, responding with 201 and the new Bookmark`, function () {
            this.retries(3)
            const newBookmark = {
                title: 'Test new Bookmark',
                url: 'https://www.thinkful.com',
                description: 'Test new Bookmark description...',
                rating: '5'
            }
            return supertest(app)
                .post('/api/bookmarks')
                .send(newBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newBookmark.title)
                    expect(res.body.url).to.eql(newBookmark.url)
                    expect(res.body.description).to.eql(newBookmark.description)
                    expect(res.body.rating).to.eql(newBookmark.rating)
                    expect(res.body).to.have.property('id')
                    /* expect(actual).to.eql(expected) */
                })
                .then(res =>
                    supertest(app)
                        .get(`/api/bookmarks/${res.body.id}`)
                        .expect(res.body)
                )
        })

        const requiredFields = ['title', 'url', 'description', 'rating']

        requiredFields.forEach(field => {
            const newBookmark = {
                title: 'Test new Bookmark',
                url: 'https://www.thinkful.com',
                description: 'Test new Bookmark description...',
                rating: '5'
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newBookmark[field]

                return supertest(app)
                    .post('/api/bookmarks')
                    .send(newBookmark)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })

        it('removes XSS attack description from response', () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()
            return supertest(app)
                .post(`/api/bookmarks`)
                .send(maliciousBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(expectedBookmark.title)
                    expect(res.body.description).to.eql(expectedBookmark.description)
                })
        })
    })

    describe(`DELETE /api/bookmarks/:bookmark_id`, () => {
        context(`Given no Bookmarks`, () => {
            it(`responds with 404`, () => {
                const BookmarkId = 123456
                return supertest(app)
                    .delete(`/api/bookmarks/${BookmarkId}`)
                    .expect(404, { error: { message: `Bookmark doesn't exist` } })
            })
        })

        context('Given there are Bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert Bookmarks', () => {
                return db
                    .into('bookmarks_list')
                    .insert(testBookmarks)
            })

            it('responds with 204 and removes the Bookmark', () => {
                const idToRemove = 3
                const expectedBookmarks = testBookmarks.filter(Bookmark => Bookmark.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/bookmarks/${idToRemove}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/bookmarks`)
                            .expect(expectedBookmarks)
                    )
            })
        })
        describe(`PATCH /api/bookmarks/:bookmark_id`, () => {
            context(`Given no bookmarks`, () => {
                it(`responds with 404`, () => {
                    const bookmarkId = 123456
                    return supertest(app)
                        .patch(`/api/bookmarks/${bookmarkId}`)
                        .expect(404, { error: { message: `Bookmark doesn't exist` } })
                })
            })
        })
        context('Given there are bookmarks in the database', () => {
            const testBookmark = makeBookmarksArray()

            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks_list')
                    .insert(testBookmark)
            })

            it('responds with 204 and updates the article', () => {
                const idToUpdate = 2
                const updateBookmark = {
                    title: 'updated article title',
                    url: 'https://www.omd.com',
                    description: 'Interview',
                    rating: '6',
                }
                const expectedBookmark = {
                    ...testBookmarks[idToUpdate - 1],
                    ...updateBookmark
                }

                return supertest(app)
                    .patch(`/api/bookmarks/${idToUpdate}`)
                    .send(updateBookmark)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/bookmarks/${idToUpdate}`)
                            .expect(expectedBookmark)
                    )

            })
            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 2
                return supertest(app)
                    .patch(`/api/bookmarks/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: `Request body must contain either 'title', 'style' or 'content'`
                        }
                    })
            })
            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2
                          const updateBookmark = {
title: 'updated boomark title',
                         }
      const expectedBookmark = {
        ...testBookmarks[idToUpdate - 1],
                    ...updateBookmark
                  }

              return supertest(app)
                    .patch(`/api/bookmarks/${idToUpdate}`)
                    .send({
          ...updateBookmark,
                          fieldToIgnore: 'should not be in GET response'
                 })
            .expect(204)
            .then(res =>
                  supertest(app)
                    .get(`/api/bookmarks/${idToUpdate}`)
                    .expect(expectedBookmark)
                )
        })
  })


        })


    })


