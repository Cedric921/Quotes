import { route } from "@/server/http/route";
import { markContactMessageAsUnread } from "@/server/services/contact.service";

export const PUT = route({ auth: "admin" }, async ({ params }) => markContactMessageAsUnread(params.id));
