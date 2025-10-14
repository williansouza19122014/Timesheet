import app from "./app";
import { connectMongo } from "./config/mongo";

const PORT = Number(process.env.PORT ?? 4000);

async function bootstrap() {
  await connectMongo();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
