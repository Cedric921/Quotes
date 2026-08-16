import { SyncAllEntities1700000000000 } from "./1700000000000-SyncAllEntities";
import { AddTopicFields1707000000000 } from "./1707000000000-AddTopicFields";
import { ConvertIdsToUuid1707100000000 } from "./1707100000000-ConvertIdsToUuid";
import { UpdateExistingTables1710200000001 } from "./1710200000001-UpdateExistingTables";
import { AddSocialAndContactTables1710300000000 } from "./1710300000000-AddSocialAndContactTables";
import { AddNotificationSettingsColumns1710400000000 } from "./1710400000000-AddNotificationSettingsColumns";
import { AddPasswordResetFields1715000000000 } from "./1715000000000-AddPasswordResetFields";
import { AddSubscriptionEnvironment1716000000000 } from "./1716000000000-AddSubscriptionEnvironment";
import { AddDefaultFlagToFontAndTheme1717000000000 } from "./1717000000000-AddDefaultFlagToFontAndTheme";
import { AddPromoCodeSystem1718000000000 } from "./1718000000000-AddPromoCodeSystem";
import { AddQueryIndexes1719000000000 } from "./1719000000000-AddQueryIndexes";

/**
 * Registered by hand, in order: Next.js bundles the server, so a glob of
 * files would find nothing at runtime. These are the NestJS API's migrations,
 * unchanged, so the `migrations` table copied from Supabase stays in step.
 */
export const migrations = [
  SyncAllEntities1700000000000,
  AddTopicFields1707000000000,
  ConvertIdsToUuid1707100000000,
  UpdateExistingTables1710200000001,
  AddSocialAndContactTables1710300000000,
  AddNotificationSettingsColumns1710400000000,
  AddPasswordResetFields1715000000000,
  AddSubscriptionEnvironment1716000000000,
  AddDefaultFlagToFontAndTheme1717000000000,
  AddPromoCodeSystem1718000000000,
  AddQueryIndexes1719000000000,
];
