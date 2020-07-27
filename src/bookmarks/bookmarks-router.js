const express = require('express')
const xss = require('xss')
const BookmarksService = require('./bookmarks-service')
const path = require('path')
const BookmarksRouter = express.Router()
const jsonParser = express.json()

const serializeBookmark = Bookmark => ({
    id: Bookmark.id,
    title: xss(Bookmark.title),
    url: xss(Bookmark.url),
    description: xss(Bookmark.description),
    rating: xss(Bookmark.rating),
})

BookmarksRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(Bookmarks => {
                res.json(Bookmarks.map(serializeBookmark))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { title, url, description, rating } = req.body
        const newBookmark = { title, url, description, rating }

        for (const [key, value] of Object.entries(newBookmark))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })

        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
            .then(Bookmark => {
                res
                    .status(201)
                    /* .location(`/bookmarks/${Bookmark.id}`) */
                    .location(path.posix.join((req.bookmarks + `/${Bookmark.id}`)))
                    .json(serializeBookmark(Bookmark))
            })
            .catch(next)
    })

BookmarksRouter
    .route('/:bookmark_id')
    .all((req, res, next) => {
        BookmarksService.getById(
            req.app.get('db'),
            req.params.bookmark_id
        )
            .then(bookmark => {
                if (!bookmark) {
                    return res.status(404).json({
                        error: { message: `Bookmark doesn't exist` }
                    })
                }
                res.bookmark = bookmark
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeBookmark(res.bookmark))
    })
    .delete((req, res, next) => {
        BookmarksService.deleteBookmark(
            req.app.get('db'),
            req.params.bookmark_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

    .patch(jsonParser, (req, res, next) => {
        const { title, url, description, rating } = req.body
        const bookmarkToUpdate = { title, url, description, rating }
        
        const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'title', 'style' or 'content'`
                }
            })
        }



        BookmarksService.updateBookmark(
            req.app.get('db'),
            req.params.bookmark_id,
            bookmarkToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)

    })


module.exports = BookmarksRouter
