import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { config } from "dotenv";
import { validate } from "./validate";

config();

const app = new Elysia();

app.use(cors());

app.post("/validate", async ({ body }: { body: any }) => {
	const cid = body.cid;
	const res = await validate({ cid });
	return new Response(JSON.stringify(res), { status: res.status });
});

app.listen(process.env.PORT || 3000, () => {
	console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
