import Stripe from "stripe";
import { config } from "dotenv";

config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function validate({ cid }: { cid: string }) {
  const authID = process.env.LOGTO_ID
  const authSecret = process.env.LOGTO_SECRET

  const BasicAuth = Buffer.from(`${authID}:${authSecret}`).toString('base64')

  const LogtoResponse = await fetch(`https://account.mikn.dev/oidc/token`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${BasicAuth}`
        },
    body: new URLSearchParams({
        grant_type: 'client_credentials',
        resource: "https://authadmin.mikandev.tech/api",
        scope: "all"
    })
    })
    const data = await LogtoResponse.json()
    console.log(data)
    const token = data.access_token

    const userData = await fetch(`https://authadmin.mikandev.tech/api/users/${cid}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    const user = await userData.json()
    console.log(user)
}