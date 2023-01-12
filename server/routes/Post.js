const router = require('express').Router()
const { createPost, likeAndUlikePost, deletePost, getPostOfFollowing, updateCaption, addComment, deleteComment } = require('../controllers/Post')
const { isAuthenticated } = require('../middleware/auth')

router.post('/post',isAuthenticated,createPost)
router.get('/post/:id',isAuthenticated,likeAndUlikePost)
router.put('/post/:id',isAuthenticated,updateCaption)
router.delete('/post/:id',isAuthenticated,deletePost)
router.get('/posts',isAuthenticated,getPostOfFollowing)
router.put('/post/comment/:id',isAuthenticated,addComment)
router.delete('/post/comment/:id',isAuthenticated,deleteComment)
module.exports = router