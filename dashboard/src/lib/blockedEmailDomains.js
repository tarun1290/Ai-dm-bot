export const BLOCKED_EMAIL_DOMAINS = [
  "gmail.com", "googlemail.com",
  "outlook.com", "hotmail.com", "live.com", "msn.com", "outlook.in",
  "yahoo.com", "yahoo.in", "yahoo.co.in", "yahoo.co.uk", "ymail.com", "rocketmail.com",
  "icloud.com", "me.com", "mac.com",
  "aol.com", "zoho.com", "protonmail.com", "proton.me", "tutanota.com", "tutamail.com",
  "mail.com", "email.com", "usa.com", "gmx.com", "gmx.net",
  "yandex.com", "yandex.ru", "mail.ru", "inbox.ru",
  "rediffmail.com", "rediff.com",
  "fastmail.com", "hushmail.com",
  "tempmail.com", "guerrillamail.com", "mailinator.com", "throwaway.email",
  "sharklasers.com", "guerrillamailblock.com", "grr.la", "dispostable.com",
  "yopmail.com", "trashmail.com", "maildrop.cc", "10minutemail.com",
];

export function isPersonalEmail(email) {
  if (!email) return false;
  const domain = email.toLowerCase().split("@")[1];
  if (!domain) return false;
  return BLOCKED_EMAIL_DOMAINS.includes(domain);
}
