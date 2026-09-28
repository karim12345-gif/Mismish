import appleSignin from "apple-signin-auth";
import { OAuth2Client } from "google-auth-library";
import { AppError } from "../../../shared/lib/AppError";
import { getFirebaseAdmin } from "../../../shared/lib/firebase";
import prisma from "../../../shared/lib/prisma";
import {
  createRefreshTokenRecord,
  generateAccessToken,
  generateRefreshToken,
} from "../../../shared/lib/token";
import type { CustomerAuthResult, SocialLoginBody } from "../auth.types";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const socialLogin = async (
  data: SocialLoginBody,
  deviceInfo?: string,
  ipAddress?: string,
): Promise<CustomerAuthResult> => {
  let email: string | undefined;
  let googleId: string | undefined;
  let appleId: string | undefined;
  let phoneNumber: string | undefined;
  let name = "User";

  if (data.provider === "google") {
    const ticket = await googleClient.verifyIdToken({
      idToken: data.idToken,
      audience: [
        process.env.GOOGLE_CLIENT_ID || "",
        process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "",
        "505490363229-enso09ftem17pq92gc6e4i60tv0qsk0d.apps.googleusercontent.com",
      ],
    });
    const payload = ticket.getPayload();
    if (!payload) throw new AppError(401, "Invalid Google token");
    email = payload.email;
    googleId = payload.sub;
    name = payload.name || name;
  } else if (data.provider === "apple") {
    const { sub, email: appleEmail } = await appleSignin.verifyIdToken(
      data.idToken,
      {
        audience: process.env.APPLE_BUNDLE_ID || "com.mismish.app",
        ignoreExpiration: true,
      },
    );
    appleId = sub;
    email = appleEmail;
  } else if (data.provider === "firebase_phone") {
    const decoded = await getFirebaseAdmin().auth().verifyIdToken(data.idToken);
    if (!decoded.phone_number) {
      throw new AppError(401, "Firebase token has no phone number");
    }
    phoneNumber = decoded.phone_number;
  }

  if (!email && !googleId && !appleId && !phoneNumber) {
    throw new AppError(400, "Could not verify identity from provider");
  }

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(googleId ? [{ googleId }] : []),
        ...(appleId ? [{ appleId }] : []),
        ...(email ? [{ email }] : []),
        ...(phoneNumber ? [{ phoneNumber }] : []),
      ],
    },
  });

  if (user) {
    if (user.isBlocked) throw new AppError(403, "This account is blocked");
    if (data.provider === "google" && !user.googleId && googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }
    if (data.provider === "apple" && !user.appleId && appleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { appleId },
      });
    }
    if (data.provider === "firebase_phone" && !user.isVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }
  } else {
    user = await prisma.user.create({
      data: { email, googleId, appleId, phoneNumber, name, isVerified: true },
    });
  }

  const accessToken = generateAccessToken(user.id, "user");
  const refreshToken = generateRefreshToken();
  await createRefreshTokenRecord(user.id, refreshToken, deviceInfo, ipAddress);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      needsProfile: !user.name || !user.email,
    },
  };
};
