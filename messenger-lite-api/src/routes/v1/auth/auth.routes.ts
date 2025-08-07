const router = require("express").Router();

router.use("/user", require("./routes/user_auth.routes"));

module.exports = router;
