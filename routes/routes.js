const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, Post } = require("../models/models");
const { authenticate } = require("../middleware/authenticate");

const router = express.Router();

router.post("/users/register", async (req, res) => {
  try {
    const { name, email, gender, password } = req.body;
    const user = new User({
      name,
      email,
      gender,
      password: await bcrypt.hash(password, 10),
    });
    await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.header("x-auth-token", token).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid email or password.");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).send("Invalid email or password.");
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.header("x-auth-token", token).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/posts", authenticate, async (req, res) => {
  try {
    const device = req.query.device;
    const user = req.user;
    let posts;
    if (!device) {
      posts = await Post.find({ user: user._id });
    } else {
      posts = await Post.find({ user: user._id, device });
    }
    res.send(posts);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.put("/posts/update", authenticate, async (req, res) => {
  try {
    const { id, title, body, device } = req.body;
    const post = await Post.findByIdAndUpdate(
      id,
      { title, body, device },
      { new: true }
    );
    if (!post) return res.status(404).send("Post not found.");
    res.send(post);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/posts/delete", authenticate, async (req, res) => {
  try {
    const { id } = req.body;
    const post = await Post.findByIdAndDelete(id);
    if (!post) return res.status(404).send("Post not found.");
    res.send(post);
  } catch (error) {
    res.status(400).send(error);
  }
});
module.exports=router;
