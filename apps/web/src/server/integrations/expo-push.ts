import "server-only";
import { Expo, type ExpoPushMessage, type ExpoPushTicket } from "expo-server-sdk";
import { In } from "typeorm";
import { repo } from "../db";
import { PushToken } from "../db/entities";

/**
 * Expo's push service, as the NestJS `NotificationsService` used it: messages
 * go out in the chunks Expo asks for (at most 100 per request), and a token
 * Expo reports as unregistered is switched off so it is not tried again.
 *
 * Only the tickets are read. Receipts (the delivery report Expo publishes
 * some minutes later) were never fetched by NestJS either, and waiting for
 * them does not fit in a serverless invocation.
 */

const globalForExpo = globalThis as unknown as { __focus_expo?: Expo };

function client(): Expo {
  // No access token: the project never enabled Expo's enhanced push security.
  globalForExpo.__focus_expo ??= new Expo();
  return globalForExpo.__focus_expo;
}

export function isExpoPushToken(token: string): boolean {
  return Expo.isExpoPushToken(token);
}

export interface PushSendResult {
  /** Tokens that passed the Expo format check and were sent to Expo. */
  attempted: number;
  /** Tickets Expo answered with an error. */
  failed: number;
  /** Tokens switched off because Expo no longer knows the device. */
  deactivated: number;
}

export async function sendPushNotifications(
  tokens: string[],
  title: string | undefined,
  body: string | undefined,
  data?: Record<string, unknown>,
): Promise<PushSendResult> {
  const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));

  if (validTokens.length === 0) {
    console.warn("[push] No valid Expo push tokens to send to");
    return { attempted: 0, failed: 0, deactivated: 0 };
  }

  const messages: ExpoPushMessage[] = validTokens.map((token) => ({
    to: token,
    sound: "default",
    title,
    body,
    data,
  }));

  const expo = client();
  const chunks = expo.chunkPushNotifications(messages);
  const invalid = new Set<string>();
  let failed = 0;

  for (const chunk of chunks) {
    try {
      const tickets: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk);

      tickets.forEach((ticket, i) => {
        if (ticket.status !== "error") return;
        failed++;
        console.error(`[push] Error sending notification: ${ticket.message}`, ticket.details);

        // Tickets come back in the order of the chunk's messages. NestJS
        // looked the token up in the full list with the chunk's index, which
        // switched off the wrong token in every chunk after the first.
        const error = ticket.details?.error as string | undefined;
        if (error === "DeviceNotRegistered" || error === "InvalidCredentials") {
          const to = chunk[i]?.to;
          if (typeof to === "string") invalid.add(to);
        }
      });
    } catch (error) {
      // One failed chunk must not stop the others, as in NestJS.
      console.error("[push] Error sending push notifications chunk", error);
    }
  }

  if (invalid.size > 0) {
    // One write for all of them, instead of one per ticket.
    await (await repo(PushToken)).update({ token: In([...invalid]) }, { isActive: false });
  }

  return { attempted: validTokens.length, failed, deactivated: invalid.size };
}
