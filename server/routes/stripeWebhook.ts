import { Router, raw } from "express";
import type Stripe from "stripe";
import { ENV } from "../_core/env.js";
import { getTestStripe } from "../_core/stripeTest.js";
import { getSignInOrigin } from "../_core/signInEmail.js";
import {
  recordInitialTestPayment,
} from "../enrollmentPaymentConfirmation.js";

const stripeWebhookRouter = Router();

stripeWebhookRouter.post(
  "/",
  raw({ type: "application/json", limit: "1mb" }),
  async (req, res) => {
    res.setHeader("Cache-Control", "no-store");

    let stripe;

    try {
      if (
        getSignInOrigin() !==
          "https://schrool-platform-staging-3583c1139100.herokuapp.com" ||
        !ENV.stripeWebhookSecret.startsWith("whsec_")
      ) {
        throw new Error("Sandbox webhook configuration required.");
      }

      stripe = getTestStripe();
    } catch {
      res.status(503).json({
        error: "Payment notifications are not configured.",
      });
      return;
    }

    const signature = req.headers["stripe-signature"];

    if (
      typeof signature !== "string" ||
      !Buffer.isBuffer(req.body)
    ) {
      res.status(400).json({ error: "Invalid notification." });
      return;
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        ENV.stripeWebhookSecret,
      );
    } catch {
      res.status(400).json({ error: "Invalid signature." });
      return;
    }

    if (event.livemode) {
      res.status(400).json({
        error: "Only sandbox notifications are accepted.",
      });
      return;
    }

    if (
      event.type !== "checkout.session.completed" &&
      event.type !== "checkout.session.async_payment_succeeded"
    ) {
      res.json({ received: true });
      return;
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (
      session.metadata?.purpose !== "initial_enrollment" ||
      session.payment_status !== "paid"
    ) {
      res.json({ received: true });
      return;
    }

    try {
      await recordInitialTestPayment(session.id);
      res.json({ received: true });
    } catch {
      console.error("Sandbox payment notification processing failed.");
      res.status(500).json({
        error: "Payment confirmation could not be recorded.",
      });
    }
  },
);

export default stripeWebhookRouter;
