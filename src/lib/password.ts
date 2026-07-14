import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
const UPPERCASE_RE = /[A-Z]/;
const SPECIAL_RE = /[^A-Za-z0-9]/; // punctuation or special character

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Parola trebuie să aibă cel puțin ${PASSWORD_MIN_LENGTH} caractere.`)
  .max(72)
  .regex(UPPERCASE_RE, "Parola trebuie să conțină cel puțin o literă mare.")
  .regex(SPECIAL_RE, "Parola trebuie să conțină cel puțin un semn de punctuație sau caracter special.");

export function passwordIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < PASSWORD_MIN_LENGTH) issues.push(`minim ${PASSWORD_MIN_LENGTH} caractere`);
  if (!UPPERCASE_RE.test(password)) issues.push("o literă mare");
  if (!SPECIAL_RE.test(password)) issues.push("un semn de punctuație / caracter special");
  return issues;
}
