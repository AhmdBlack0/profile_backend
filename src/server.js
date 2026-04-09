import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const port = process.env.PORT || 5000;

const startServer = async () => {
  const [{ default: app }, { connectDb }] = await Promise.all([
    import("./app.js"),
    import("./config/db.js"),
  ]);

  await connectDb();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on port ${port}`);
  });
};

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
