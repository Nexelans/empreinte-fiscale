import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Generate a verification token for email verification
 * @param email User's email
 * @returns Token string
 */
export async function generateVerificationToken(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Create new token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Verify an email verification token
 * @param token Token to verify
 * @returns Email if valid, null if invalid or expired
 */
export async function verifyEmailToken(token: string): Promise<string | null> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return null;
  }

  if (verificationToken.expires < new Date()) {
    // Token expired, delete it
    await prisma.verificationToken.delete({
      where: { token },
    });
    return null;
  }

  // Token is valid
  return verificationToken.identifier;
}

/**
 * Generate a password reset token
 * @param email User's email
 * @returns Token string
 */
export async function generatePasswordResetToken(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: `reset:${email}`,
    },
  });

  // Create new token
  await prisma.verificationToken.create({
    data: {
      identifier: `reset:${email}`,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Verify a password reset token
 * @param token Token to verify
 * @returns Email if valid, null if invalid or expired
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return null;
  }

  if (verificationToken.expires < new Date()) {
    // Token expired, delete it
    await prisma.verificationToken.delete({
      where: { token },
    });
    return null;
  }

  // Extract email from identifier (format: "reset:email@example.com")
  const email = verificationToken.identifier.replace("reset:", "");
  return email;
}
