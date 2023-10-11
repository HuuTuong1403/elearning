import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { generateToken, NextResponseHandler } from "@/lib/utils";
import logger from "@/lib/logger";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password, phone } = body;

    try {
      const { tokenHash, tokenExpired } = generateToken();

      await sendMail({
        code: "MailConfirmUser",
        to: email,
        subject: "[HTHL-Company] Xác nhận email của bạn (Hợp lệ trong 3 phút)",
        keyValue: {
          key: "{{authenURL}}",
          value: `http://localhost:3000/api/auth/mail-confirm/${tokenHash}`,
        },
      });

      const passwordHash = await bcrypt.hash(
        password,
        parseInt(process.env.BCRYPT_SALT as string)
      );

      await db.user.create({
        data: {
          username: username as string,
          email: email as string,
          passwordHash: passwordHash,
          phone: phone as string,
          emailToken: tokenHash,
          emailExpired: tokenExpired,
        },
      });

      return new NextResponseHandler(
        "Hệ thống đã gửi email xác thực đến email bạn đã đăng ký! Vui lòng kiểm tra hòm thư",
        "action"
      ).handle();
    } catch (error) {
      throw error;
    }
  } catch (error: any) {
    logger.error(error.stack);
    return new NextResponseHandler("Lỗi hệ thống", "action", 500).handle();
  }
}
