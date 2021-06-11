const User = require('../models/userModel')
const Post = require('../models/postModel')
const Category = require('../models/categoryModel')
const Comment = require('../models/commentModel')

module.exports = {
     
    index: async (req, res) => {
        const posts = await Post.find()
        const _posts = posts.map(post => {
            return {
                _id: post._id,
                title: post.title,
                status: post.status,
                description: post.description,
                creationDate: post.creationDate
            }
        })

        const categories = await Category.find()
        const _categories = categories.map(cats => {
            return {
                _id: cats._id,
                title: cats.title
            }
        })
        
        res.render('default/index', {
            posts: _posts,
            categories: _categories
        })
    },

    loginGet: (req, res) => {
        res.render('default/login')
    },

    loginPost: (req, res) => {
    
    },

    registerGet: (req, res) => {
        res.render('default/register')
    },
    
    registerPost: (req, res) => {
        let errors = []

        if (!req.body.firstName) {
            errors.push({message: 'First name is mandatory'})
        }
        if (!req.body.lastName) {
            errors.push({message: 'Last name is mandatory'})
        }
        if (!req.body.email) {
            errors.push({message: 'Email field is mandatory'})
        }
        if (req.body.password !== req.body.passwordConfirm) {
            errors.push({message: 'Passwords do not match'})
        }

        if(errors.length > 0) {
            return res.render('default/register', {
                errors,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email
            })
        }

        User.findOne({email: req.body.email}).then(user => {
            if(user){
                req.flash('error-message', 'Email already exists, try to login')
                res.redirect('/login')
            } else {
                const newUser = new User(req.body)

                newUser.save().then(user => {
                    req.flash('success-message', 'You are now registered')
                    res.redirect('/login')
                })
            }
        })
    },

    getSinglePost: (req, res) => {
        const id = req.params.id

        Post.findById(id)
            .populate({path: 'comments', populate: {path: 'user', model: 'user'}})
            .then(post => {
            const body = post.comments
            
            const _comments = body.map(comment => {
                const user = comment.user
                const _user = {
                        firstName: user.firstName,
                        lastName: user.lastName
                }
                
                return {
                    _id: comment.id,
                    body: comment.body,
                    user: _user,
                    date: comment.date,
                    commentIsApproved: comment.commentIsApproved
                }
            })

            const _post = {
                _id: post._id,
                title: post.title,
                status: post.status,
                description: post.description,
                creationDate: post.creationDate,
                comments: _comments,
                file: post.file,
            }

            if (!post) {
                return res.status(404).json({message: 'No Post Found!'})
            }
            
            res.render('default/singlePost', {
                post: _post
            })
            
        })
    },

    logOut: (req, res) => {
        req.logOut()
        req.flash('success-message', 'Logout successfully')
        res.redirect('/')
    },

    submitComment: (req, res) => {
        if(req.user) {
            Post.findById(req.body.id).then(post => {
                const newComment = new Comment({
                    user: req.user.id,
                    body: req.body.comment_body
                })

                post.comments.push(newComment)
                post.save().then(savedPost => {
                    newComment.save().then(savedComment => {
                        req.flash('success-message', 'Your comment is submitted for review.')
                        res.redirect(`/post/${post._id}`)
                    })
                })
            })
        } else {
            req.flash('error-message', 'Login first to comment')
            res.redirect('/login')
        }
    }

}