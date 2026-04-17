const app  = require("./app");
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT",  () => server.close(() => process.exit(0)));
