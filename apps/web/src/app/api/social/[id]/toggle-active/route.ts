import { route } from "@/server/http/route";
import { toggleSocialNetworkActive } from "@/server/services/social.service";

export const PUT = route({ auth: "admin" }, async ({ params }) => toggleSocialNetworkActive(params.id));
