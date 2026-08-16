/**
 * Le contenu des messages, séparé de la mécanique d'envoi.
 *
 * L'application mobile parle dix langues ; un code de réinitialisation rédigé
 * dans une langue que la personne ne lit pas est un code qu'elle n'utilise pas.
 * Chaque locale supportée par l'app a donc son texte, et tout ce qui n'est pas
 * reconnu retombe sur l'anglais plutôt que sur une chaîne vide.
 */

export type RenderedMail = {
  subject: string;
  text: string;
  html: string;
};

const SUPPORTED = [
  'fr',
  'en',
  'es',
  'de',
  'it',
  'nl',
  'pt',
  'ru',
  'tr',
  'ar',
  'zh',
] as const;

export type MailLocale = (typeof SUPPORTED)[number];

/**
 * Normalise ce que l'app envoie (`fr-FR`, `EN`, `null`…) vers une locale connue.
 */
export function mailLocale(locale: string | null | undefined): MailLocale {
  const base = (locale ?? '').trim().toLowerCase().split(/[-_]/)[0];
  return (SUPPORTED as readonly string[]).includes(base)
    ? (base as MailLocale)
    : 'en';
}

type ResetCopy = {
  subject: string;
  title: string;
  greeting: (name?: string) => string;
  intro: string;
  expiry: (minutes: number) => string;
  ignore: string;
  signature: string;
  dir?: 'rtl';
};

const RESET: Record<MailLocale, ResetCopy> = {
  fr: {
    subject: 'Focus — Code de réinitialisation de mot de passe',
    title: 'Réinitialisation du mot de passe',
    greeting: (name) => (name ? `Bonjour ${name},` : 'Bonjour,'),
    intro: 'Voici votre code de réinitialisation :',
    expiry: (m) => `Ce code expire dans ${m} minutes.`,
    ignore:
      "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.",
    signature: "— L'équipe Focus",
  },
  en: {
    subject: 'Focus — Password reset code',
    title: 'Reset your password',
    greeting: (name) => (name ? `Hi ${name},` : 'Hi,'),
    intro: 'Here is your reset code:',
    expiry: (m) => `This code expires in ${m} minutes.`,
    ignore: "If you didn't request this, you can ignore this message.",
    signature: '— The Focus team',
  },
  es: {
    subject: 'Focus — Código de restablecimiento de contraseña',
    title: 'Restablecer tu contraseña',
    greeting: (name) => (name ? `Hola ${name}:` : 'Hola:'),
    intro: 'Este es tu código de restablecimiento:',
    expiry: (m) => `Este código caduca en ${m} minutos.`,
    ignore: 'Si no has solicitado esto, puedes ignorar este mensaje.',
    signature: '— El equipo de Focus',
  },
  de: {
    subject: 'Focus — Code zum Zurücksetzen des Passworts',
    title: 'Passwort zurücksetzen',
    greeting: (name) => (name ? `Hallo ${name},` : 'Hallo,'),
    intro: 'Hier ist dein Code zum Zurücksetzen:',
    expiry: (m) => `Dieser Code läuft in ${m} Minuten ab.`,
    ignore: 'Wenn du das nicht angefordert hast, ignoriere diese Nachricht.',
    signature: '— Dein Focus-Team',
  },
  it: {
    subject: 'Focus — Codice di reimpostazione della password',
    title: 'Reimposta la password',
    greeting: (name) => (name ? `Ciao ${name},` : 'Ciao,'),
    intro: 'Ecco il tuo codice di reimpostazione:',
    expiry: (m) => `Questo codice scade tra ${m} minuti.`,
    ignore:
      'Se non hai richiesto tu questa operazione, ignora questo messaggio.',
    signature: '— Il team Focus',
  },
  nl: {
    subject: 'Focus — Code om je wachtwoord opnieuw in te stellen',
    title: 'Wachtwoord opnieuw instellen',
    greeting: (name) => (name ? `Hallo ${name},` : 'Hallo,'),
    intro: 'Dit is je code:',
    expiry: (m) => `Deze code verloopt over ${m} minuten.`,
    ignore: 'Heb je dit niet aangevraagd? Dan kun je dit bericht negeren.',
    signature: '— Het Focus-team',
  },
  pt: {
    subject: 'Focus — Código de redefinição de senha',
    title: 'Redefinir a sua senha',
    greeting: (name) => (name ? `Olá ${name},` : 'Olá,'),
    intro: 'Este é o seu código de redefinição:',
    expiry: (m) => `Este código expira em ${m} minutos.`,
    ignore: 'Se não foi você que fez este pedido, ignore esta mensagem.',
    signature: '— A equipa Focus',
  },
  ru: {
    subject: 'Focus — код для сброса пароля',
    title: 'Сброс пароля',
    greeting: (name) => (name ? `Здравствуйте, ${name}!` : 'Здравствуйте!'),
    intro: 'Ваш код для сброса пароля:',
    expiry: (m) => `Код действителен ${m} минут.`,
    ignore:
      'Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.',
    signature: '— Команда Focus',
  },
  tr: {
    subject: 'Focus — Şifre sıfırlama kodu',
    title: 'Şifreni sıfırla',
    greeting: (name) => (name ? `Merhaba ${name},` : 'Merhaba,'),
    intro: 'Sıfırlama kodun:',
    expiry: (m) => `Bu kodun süresi ${m} dakika içinde doluyor.`,
    ignore: 'Bu isteği sen yapmadıysan bu mesajı yok sayabilirsin.',
    signature: '— Focus ekibi',
  },
  ar: {
    subject: 'Focus — رمز إعادة تعيين كلمة المرور',
    title: 'إعادة تعيين كلمة المرور',
    greeting: (name) => (name ? `مرحبًا ${name}،` : 'مرحبًا،'),
    intro: 'هذا هو رمز إعادة التعيين الخاص بك:',
    expiry: (m) => `تنتهي صلاحية هذا الرمز خلال ${m} دقيقة.`,
    ignore: 'إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.',
    signature: '— فريق Focus',
    dir: 'rtl',
  },
  zh: {
    subject: 'Focus — 密码重置验证码',
    title: '重置密码',
    greeting: (name) => (name ? `${name} 您好，` : '您好，'),
    intro: '这是您的重置验证码：',
    expiry: (m) => `该验证码将在 ${m} 分钟后失效。`,
    ignore: '如果这不是您本人的操作，请忽略此邮件。',
    signature: '— Focus 团队',
  },
};

/**
 * Le code de réinitialisation, dans la langue de la personne.
 *
 * La version texte n'est pas une politesse : les clients qui bloquent le HTML
 * doivent afficher le code, sans quoi le message est arrivé pour rien.
 */
export function passwordResetMail(params: {
  locale: string | null | undefined;
  code: string;
  name?: string;
  ttlMinutes: number;
}): RenderedMail {
  const copy = RESET[mailLocale(params.locale)];
  const greeting = copy.greeting(params.name?.trim() || undefined);
  const expiry = copy.expiry(params.ttlMinutes);

  const text = [
    greeting,
    '',
    `${copy.intro} ${params.code}`,
    '',
    expiry,
    copy.ignore,
    '',
    copy.signature,
  ].join('\n');

  const dir = copy.dir === 'rtl' ? ' dir="rtl"' : '';
  const html = `
      <div${dir} style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
        <h2 style="margin: 0 0 16px; font-size: 22px;">${escapeHtml(copy.title)}</h2>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.5;">${escapeHtml(greeting)}</p>
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.5;">${escapeHtml(copy.intro)}</p>
        <div dir="ltr" style="background: #111; color: #fff; font-size: 32px; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 12px; font-weight: 600;">${escapeHtml(params.code)}</div>
        <p style="margin: 24px 0 0; font-size: 13px; color: #6b7280; line-height: 1.5;">${escapeHtml(expiry)} ${escapeHtml(copy.ignore)}</p>
        <p style="margin: 24px 0 0; font-size: 13px; color: #6b7280;">${escapeHtml(copy.signature)}</p>
      </div>
    `;

  return { subject: copy.subject, text, html };
}

/**
 * Le prénom vient de l'utilisateur : il traverse un document HTML, il est donc
 * échappé comme n'importe quelle autre donnée non maîtrisée.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
