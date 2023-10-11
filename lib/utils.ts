import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as crypto from "crypto";
import { NextResponse } from "next/server";
import { IActionResponse, ISearchResponse } from "./interface";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateToken = (
  time: number = 3
): {
  tokenHash: string;
  tokenExpired: string;
} => {
  const token = crypto.randomBytes(23).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const tokenExpired = Date.now() + time * 60 * 1000; // Hạn 3 phút
  return {
    tokenHash,
    tokenExpired: tokenExpired.toString(),
  };
};

export const replaceContent = (
  content: string,
  keyValue: { key: string; value: string }[] | { key: string; value: string }
): string => {
  let newContent = "";

  if (keyValue) {
    if (Array.isArray(keyValue)) {
      keyValue.forEach(({ key, value }) => {
        newContent = content.replace(eval("/" + key + "/g"), value);
      });
    } else {
      newContent = content.replace(
        eval("/" + keyValue.key + "/g"),
        keyValue.value
      );
    }
  }

  return newContent;
};

export class NextResponseHandler<T> {
  message: string;
  status: number;
  data?: T;
  type: string;

  constructor(
    message: string,
    type: "action" | "search" = "action",
    status: number = 200,
    data?: T
  ) {
    this.message = message;
    this.status = status;
    this.type = type;

    if (type === "search" && data) {
      this.data = data;
    }
  }

  handle(): NextResponse<unknown> {
    if (this.status === 200) {
      if (this.type === "search") {
        const body: ISearchResponse<any> = {
          data: this.data,
          status: this.status,
        };
        return NextResponse.json(body);
      } else {
        const body: IActionResponse = {
          message: this.message,
          status: this.status,
        };
        return NextResponse.json(body);
      }
    } else {
      const body: IActionResponse = {
        message: this.message,
        status: this.status,
      };
      return NextResponse.json(body, { status: this.status });
    }
  }
}
