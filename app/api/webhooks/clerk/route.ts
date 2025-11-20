/* eslint-disable camelcase */
import {
  createUser,
  cleanupUserData,
  updateUser,
} from "@/lib/action/user.actions";
import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  const eventType = evt.type;

  // CREATE
  if (eventType === "user.created") {
    const {
      id,
      email_addresses,
      image_url,
      first_name,
      last_name,
      username,
      public_metadata,
    } = evt.data;
    const websiteUrl = (public_metadata?.websiteUrl as string) || null;
    const scrappedFile = (public_metadata?.scrappedFile as string) || null;
    const phone = (public_metadata?.phone as string) || null;
    const isScrapped = (public_metadata?.isScrapped as boolean) || false;
    const totalReplies = (public_metadata?.totalReplies as number) || 0;
    const replyLimit = (public_metadata?.replyLimit as number) || 500;
    const accountLimit = (public_metadata?.accountLimit as number) || 1;
    const timestamps = (public_metadata?.timestamps as boolean) || true;

    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username!,
      firstName: first_name!,
      lastName: last_name!,
      websiteUrl: websiteUrl!,
      isScrapped: isScrapped,
      scrappedFile: scrappedFile!,
      phone: phone!,
      totalReplies: totalReplies,
      replyLimit: replyLimit,
      accountLimit: accountLimit,
      photo: image_url,
      timestamps,
    };
    const newUser = await createUser(user);

    // Set public metadata
    if (newUser) {
      const client = await clerkClient(); // ← Await the clerkClient
      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          userId: newUser._id,
        },
      });
    }

    return NextResponse.json({ message: "OK", user: newUser });
  }

  // UPDATE
  if (eventType === "user.updated") {
    const { id, image_url, first_name, last_name, username } = evt.data;

    const user = {
      firstName: first_name!,
      lastName: last_name!,
      username: username!,
      photo: image_url,
    };

    const updatedUser = await updateUser(id, user);

    return NextResponse.json({ message: "OK", user: updatedUser });
  }

  // DELETE
  if (eventType === "user.deleted") {
    const { id } = evt.data;

    const deletedUser = await cleanupUserData(id!);

    return NextResponse.json({ message: "OK", user: deletedUser });
  }

  return new Response("", { status: 200 });
}
