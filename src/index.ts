import { Elysia } from "elysia";
import { config } from "dotenv";
import { validate } from "./validate";

config();

const app = new Elysia()

app.post("/validate", async ({ body }: { body: any }) => {
  const cid = body.cid;
  await validate({ cid });
  return { status: "ok" };
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
})