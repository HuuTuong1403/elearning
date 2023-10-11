import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { generateToken } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    const user = await db.user.findFirst({ where: { emailToken: token } });

    if (!user) {
      return new NextResponse("Token không hợp lệ", { status: 404 });
    }

    if (user.emailExpired) {
      if (new Date(+user.emailExpired).getTime() < Date.now()) {
        const { tokenHash, tokenExpired } = generateToken();
        await db.user.update({
          where: {
            username: user.username,
          },
          data: {
            emailToken: tokenHash,
            emailExpired: tokenExpired,
          },
        });
        try {
          await sendMail({
            code: "MailConfirmUser",
            to: user.email,
            subject:
              "[HTHL-Company] Xác nhận email của bạn (Hợp lệ trong 3 phút)",
            keyValue: {
              key: "{{authenURL}}",
              value: `http://localhost:3000/api/auth/mail-confirm/${tokenHash}`,
            },
          });

          return NextResponse.json(
            "Token đã hết hạn! Hệ thống đã gửi link xác nhận vào hòm thư của bạn"
          );
        } catch (error) {
          throw error;
        }
      } else {
        await db.user.update({
          where: {
            username: user.username,
          },
          data: {
            emailVerified: 1,
            emailToken: null,
            emailExpired: null,
          },
        });

        const profile = await db.profile.create({
          data: {
            userId: user.id,
          },
        });

        await db.address.create({
          data: {
            profileId: profile.id,
          },
        });

        return NextResponse.json(
          "Xác thực email thành công! Vui lòng đăng nhập vào hệ thống"
        );
      }
    }
  } catch (error) {
    console.log("[MAIL-CONFIRM]", error);
    return new NextResponse("Inernal Error", { status: 500 });
  }
}
