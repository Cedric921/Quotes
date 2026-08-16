import { route } from "@/server/http/route";
import { findActiveSocialNetworks } from "@/server/services/social.service";

/** Public: the active networks, for the mobile app. */
export const GET = route({ auth: "public" }, async () => findActiveSocialNetworks());
