const Post = require("../models/postModel");
const Category = require("../models/categoryModel");
const Comment = require("../models/commentModel");
const { isEmpty } = require("../config/customFunctions");

module.exports = {
  index: (req, res) => {
    res.render("admin/index");
  },

  getPosts: async (req, res) => {
    Post.find()
      .populate("category")
      .then((posts) => {
        const userPost = {
          usersPost: posts.map((post) => {
            const category = post.category.title;
            return {
              _id: post._id,
              title: post.title,
              description: post.description,
              allowComments: post.allowComments,
              category,
              status: post.status,
            };
          }),
        };
        res.render("admin/posts/index", {
          usersPost: userPost.usersPost,
        });
      });
  },

  submitPosts: (req, res) => {
    const commentsAllowed = req.body.allowComments ? true : false;

    // Check for any input File
    let filename = "";

    if (!isEmpty(req.files)) {
      let file = req.files.uploadedFile;
      filename = file.name;
      let uploadDir = "./public/uploads/";

      file.mv(uploadDir + filename, (e) => {
        if (e) {
          throw e;
        }
      });
    }

    const newPost = new Post({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      allowComments: commentsAllowed,
      category: req.body.category,
      file: `/uploads/${filename}`,
    });
    newPost.save().then((post) => {
      req.flash("success-message", "Post created successfully");
      res.redirect("/admin/posts");
    });
  },

  createPosts: (req, res) => {
    Category.find().then((categories) => {
      const cats = {
        category: categories.map((cat) => {
          return {
            _id: cat._id,
            title: cat.title,
          };
        }),
      };

      res.render("admin/posts/create", {
        categories: cats.category,
      });
    });
  },

  editPost: (req, res) => {
    const id = req.params.id;
    Post.findById(id).then((posts) => {
      const post = {
        _id: posts._id,
        title: posts.title,
        description: posts.description,
        allowComments: posts.allowComments,
        category: posts.category,
        status: posts.status,
      };

      Category.find().then((categories) => {
        const cats = {
          category: categories.map((cat) => {
            return {
              _id: cat._id,
              title: cat.title,
            };
          }),
        };

        res.render("admin/posts/edit", {
          post,
          categories: cats.category,
        });
      });
    });
  },

  editPostSubmit: (req, res) => {
    const commentsAllowed = req.body.allowComments ? true : false;

    const id = req.params.id;
    Post.findById(id).then((post) => {
      post.title = req.body.title;
      post.status = req.body.status;
      post.allowComments = commentsAllowed;
      post.description = req.body.description;
      post.category = req.body.category;

      post.save().then((updatePost) => {
        req.flash(
          "success-message",
          `The post ${updatePost.title} has been updated!`
        );
        res.redirect("/admin/posts");
      });
    });
  },

  deletePost: (req, res) => {
    Post.findByIdAndDelete(req.params.id).then((deletedPost) => {
      req.flash(
        "success-message",
        `The post ${deletedPost.title} has been deleted.`
      );
      res.redirect("/admin/posts");
    });
  },

  // ALL CATEGORY METHODS
  getCategories: (req, res) => {
    Category.find().then((categories) => {
      const cats = {
        category: categories.map((cat) => {
          return {
            _id: cat._id,
            title: cat.title,
          };
        }),
      };

      res.render("admin/category", {
        category: cats.category,
      });
    });
  },

  createCategories: (req, res) => {
    let categoryName = req.body.title;

    if (categoryName) {
      const newCategory = new Category({
        title: categoryName,
      });

      newCategory.save().then((category) => {
        req.flash("success-message", "Category created successfully");
        res.redirect("/admin/category");
      });
    }
  },

  editCategoriesGetRoute: async (req, res) => {
    const catId = req.params.id;

    const cats = await Category.find();
    const _cats = {
      category: cats.map((cat) => {
        return {
          _id: cat._id,
          title: cat.title,
        };
      }),
    };

    Category.findById(catId).then((cat) => {
      const _cat = {
        _id: cat._id,
        title: cat.title,
      };
      res.render("admin/category/edit", {
        category: _cat,
        categories: _cats.category,
      });
    });
  },

  editCategoriesPostRoute: (req, res) => {
    const catId = req.params.id;
    const newTitle = req.body.title;
    console.log(req.body, req.params);

    if (newTitle) {
      Category.findById(catId).then((category) => {
        category.title = newTitle;

        category.save().then((updated) => {
          req.flash("success-message", "Category updated successfully");
          res.redirect("/admin/category");
        });
      });
    }
  },

  deleteCategory: (req, res) => {
    Category.findByIdAndDelete(req.params.id).then((deletedCategory) => {
      req.flash(
        "success-message",
        `The Category ${deletedCategory.title} has been deleted.`
      );
      res.redirect("/admin/category");
    });
  },

  getComments: (req, res) => {
    Comment.find()
      .populate("user")
      .then((comments) => {
        const _comments = {
          usersComment: comments.map((comment) => {
            const user = comment.user.firstName;
            return {
              _id: comment._id,
              date: comment.date,
              body: comment.body,
              commentIsApproved: comment.commentIsApproved,
              user,
            };
          }),
        };

        res.render("admin/comments/index", {
          comments: _comments.usersComment,
        });
      });
  },
};
