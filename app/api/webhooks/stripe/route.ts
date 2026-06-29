import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.client_reference_id) {
          const userId = session.client_reference_id;
          
          // You can map specific plan strings depending on metadata or the price ID
          const planType = session.metadata?.plan_type || "creator"; 
          
          await supabase
            .from("profiles")
            .update({
              plan_type: planType,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
            })
            .eq("id", userId);
        }
        break;
      }
      
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        
        let planType = "free";
        if (status === "active" || status === "trialing") {
          planType = subscription.metadata?.plan_type || "creator";
        }
        
        await supabase
          .from("profiles")
          .update({
            plan_type: planType,
            stripe_subscription_id: subscription.id,
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        await supabase
          .from("profiles")
          .update({
            plan_type: "free",
            stripe_subscription_id: null,
          })
          .eq("stripe_customer_id", customerId);
        break;
      }
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe Webhook DB Error:", error);
    return NextResponse.json({ error: "Internal Database Error" }, { status: 500 });
  }
}
