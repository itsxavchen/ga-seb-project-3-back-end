// ---------- Starter Code ----------

const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Post = require("../models/post.js");
const router = express.Router();

// ---------- Routes ----------

//Create a post
router.post("/", verifyToken, async (req, res) => {
  try {
    console.log(req.user)
    req.body.author = req.user._id;
    const post = await Post.create(req.body);
    post._doc.author = req.user;
    res.status(201).json(post);
  } catch (err) {
    console.log(err)
    res.status(500).json({ err: err.message });
  }
});

//View all posts
router.get("/", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("author")
      .sort({ createdAt: "desc" });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//View one post
router.get("/:postId", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate([
      'author',
      'comments.author',
    ]);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//Update one post
router.put("/:postId", verifyToken, async (req, res) => {
  try {
    // Find the post:
    const post = await Post.findById(req.params.postId);

    // Check permissions:
    if (!post.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

    // Update post:
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      req.body,
      { new: true }
    );

    // Append req.user to the author property:
    updatedPost._doc.author = req.user;

    // Issue JSON response:
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//Delete one post
router.delete("/:postId", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

    const deletedPost = await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json(deletedPost);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//Create a comment
router.post("/:postId/comments", verifyToken, async (req, res) => {
  try {
    req.body.author = req.user._id;
    const post = await Post.findById(req.params.postId);
    post.comments.push(req.body);
    await post.save();

    // Find the newly created comment:
    const newComment = post.comments[post.comments.length - 1];

    newComment._doc.author = req.user;

    // Respond with the newComment:
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//Update a comment
router.put("/:postId/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    const comment = post.comments.id(req.params.commentId);

    // ensures the current user is the author of the comment
    if (comment.author.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this comment" });
    }

    comment.text = req.body.text;
    await post.save();
    res.status(200).json({ message: "Comment updated successfully" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//Delete a comment
router.delete("/:postId/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    const comment = post.comments.id(req.params.commentId);

    // ensures the current user is the author of the comment
    if (comment.author.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this comment" });
    }

    post.comments.remove({ _id: req.params.commentId });
    await post.save();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});



module.exports = router;