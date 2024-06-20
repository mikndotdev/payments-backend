import Stripe from "stripe";
import { config } from "dotenv";

config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

export async function validate({ cid }: { cid: string }) {
	const authID = process.env.LOGTO_ID;
	const authSecret = process.env.LOGTO_SECRET;

	const BasicAuth = Buffer.from(`${authID}:${authSecret}`).toString("base64");

	const LogtoResponse = await fetch(`https://account.mikn.dev/oidc/token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Basic ${BasicAuth}`,
		},
		body: new URLSearchParams({
			grant_type: "client_credentials",
			scope: "all",
			resource: `https://default.logto.app/api`,
		}),
	});
	const data = await LogtoResponse.json();
	console.log(data);
	const token = data.access_token;

	const userData = await fetch(`https://account.mikn.dev/api/users/${cid}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	const user = await userData.json();

	const discordID = user.identities.discord.userId;
	const email = user.primaryEmail;

	console.log(discordID, email);

	const session = await stripe.checkout.sessions.list({
		customer_details: {
			email: email,
		},
		limit: 1,
	});

	const status = session.data[0].payment_status as string;
	const metadata = session.data[0].metadata;
	const id = session.data[0].id;
	const afterExpiration = session.data[0].after_expiration;
	const price = session.data[0].amount_total;
	const creationTime = session.data[0].created;
	const priceInBucks = price !== null ? price / 100 : null;

	const lineItems = await stripe.checkout.sessions.listLineItems(id);

	const prodName = lineItems.data[0].description;
	const quantity = lineItems.data[0].quantity;

	console.log(
		status,
		metadata,
		id,
		afterExpiration,
		priceInBucks,
		prodName,
		quantity,
	);

	if (status !== "paid") {
		return {
			status: 400,
			message: "IncompletePayment",
		};
	}

	if (metadata?.discord !== discordID) {
		return {
			status: 400,
			message: "UIDValidationError",
		};
	}

	if (afterExpiration) {
		return {
			status: 400,
			message: "Expired",
		};
	} else {
		return {
			status: 200,
			message: "Success",
			id: id,
			prodName: prodName,
			quantity: quantity,
			price: priceInBucks,
		};
	}
}
