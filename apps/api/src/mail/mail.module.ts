import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

/**
 * Global : l'envoi d'e-mail n'appartient pas à l'authentification. Le module
 * contact et les rappels d'abonnement s'en serviront sans avoir à réimporter
 * quoi que ce soit.
 */
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
