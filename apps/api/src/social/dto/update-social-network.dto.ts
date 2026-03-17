import { PartialType } from '@nestjs/mapped-types';
import { CreateSocialNetworkDto } from './create-social-network.dto';

export class UpdateSocialNetworkDto extends PartialType(CreateSocialNetworkDto) {}

