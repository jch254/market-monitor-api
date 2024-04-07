import * as sgMail from "@sendgrid/mail";
import { upperFirst } from "lodash";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export const sendWelcomeEmail = async (
  destinationEmail: string,
  username: string,
  shipsFrom: string
) => {
  const shipsFromList = shipsFrom
    .split(",")
    .map((s) => upperFirst(s.trim()))
    .join(", ");

  const msg: sgMail.MailDataRequired = {
    to: destinationEmail,
    from: process.env.SENDER_EMAIL || "",
    subject: `Discogs Wantlist Digest for ${username} set up`,
    text: `Your Discogs Wantlist Digest for ${username} has been successfully set up. You will receive a daily email with new items from the following locations: ${shipsFromList}.`,
  };

  try {
    await sgMail.send(msg);
  } catch (error: any) {
    console.error(error);

    if (error.response) {
      console.error(error.response.body);
    }

    throw error;
  }
};
