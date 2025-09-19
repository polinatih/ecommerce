import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const addressObj = session.customer_details?.address;
  const phone = session.customer_details?.phone || '';

  const addressComponents = [
    addressObj?.line1,
    addressObj?.line2,
    addressObj?.city,
    addressObj?.state,
    addressObj?.postal_code,
    addressObj?.country,
  ];

  const addressString = addressComponents.filter(Boolean).join(', ');

  if (event.type === "checkout.session.completed") {
    const order = await prismadb.order.update({
      where: {
        id: session?.metadata?.orderId,
      },
      data: {
        isPaid: true,
        address: addressString,
        phone: phone,
      },
      include: {
        orderItems: true, 
      },
    });

    if (order.orderItems) {
      const productIds = order.orderItems.map((oi: { productId: string }) => oi.productId);
      await prismadb.product.updateMany({
        where: {
          id: { in: productIds }
        },
        data: { isArchived: true }
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}