import { google } from "googleapis";
import Stripe from "stripe";
import { Resend } from "resend";
import twilio from "twilio";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

export async function createCalendarEvent(summary: string, startDateTime: string, endDateTime: string) {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    return null;
  }

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  const calendar = google.calendar({ version: "v3", auth });
  const event = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: {
      summary,
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime },
    },
  });
  return event.data.id ?? null;
}

export async function sendEmailReminder(to: string, subject: string, message: string) {
  if (!process.env.RESEND_FROM_EMAIL) return;
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject,
    text: message,
  });
}

export async function sendSmsReminder(to: string, message: string) {
  if (!twilioClient || !process.env.TWILIO_FROM_PHONE) return;
  await twilioClient.messages.create({
    to,
    from: process.env.TWILIO_FROM_PHONE,
    body: message,
  });
}

export async function createPaymentIntent(amountCents: number, customerEmail: string) {
  return stripe.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    receipt_email: customerEmail,
  });
}
