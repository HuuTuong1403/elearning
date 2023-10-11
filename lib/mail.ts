import * as _ from "lodash";
import nodemailer from "nodemailer";
import { db } from "./db";
import { replaceContent } from "./utils";

const transport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  ignoreTLS: true,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PW,
  },
});

interface IMail {
  code: "MailConfirmUser";
  to?: string[] | string;
  cc?: string[] | string;
  bcc?: string[] | string;
  subject?: string;
  keyValue?: { key: string; value: string }[] | { key: string; value: string };
}

const getMailTemplateWithCode = async ({
  code,
  keyValue,
}: Pick<IMail, "code" | "keyValue">): Promise<string> => {
  const template = await db.template.findUnique({
    where: {
      code,
    },
  });

  if (template) {
    return replaceContent(template.content, keyValue!);
  }

  return "";
};

export const sendMail = async ({
  code,
  bcc,
  cc,
  to,
  subject,
  keyValue,
}: IMail) => {
  const html = await getMailTemplateWithCode({ code, keyValue });

  if (Array.isArray(bcc) && bcc.length > 0) {
    bcc = _.uniq(bcc);
  }

  if (Array.isArray(cc) && cc.length > 0) {
    cc = _.uniq(cc);
  }

  if (Array.isArray(to) && to.length > 0) {
    to = _.uniq(to);
  }

  try {
    await transport.sendMail({
      to,
      cc,
      bcc,
      subject,
      html,
    });
    transport.close();
  } catch (error) {
    console.log("[SEND_MAIL]", error);
    throw new Error();
  }
};
