const {
  userSignup,
} = require("../../../../controllers/auth/userSignup.controller");
const router = require("express").Router();

router.post("/sign-up", userSignup);

module.exports = router;
