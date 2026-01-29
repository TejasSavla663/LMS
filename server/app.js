const express = require("express");
const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// routes
// routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/courses", require("./routes/courseRoute"));
app.use("/api/educators", require("./routes/educatorRoutes"));

module.exports = app;
