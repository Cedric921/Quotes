import { route } from "@/server/http/route";
import { getUsersByPromoCode } from "@/server/services/promo-codes.service";

// NestJS named this segment `:code`; Next.js needs one name per level, so the
// code arrives as `params.id`.
export const GET = route({ auth: "admin" }, ({ params }) => getUsersByPromoCode(params.id));
