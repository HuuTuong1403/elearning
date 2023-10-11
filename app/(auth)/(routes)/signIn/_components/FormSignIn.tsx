"use client";

import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormItem,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { InputIcon } from "@/components/inputIcon";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  username: z.string().min(1, { message: "Tên đăng nhập không được trống" }),
  password: z.string().min(1, { message: "Mật khẩu không được trống" }),
});

export const FormSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isShowPass, setIsShowPass] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    signIn("credentials", {
      ...values,
      redirect: false,
    })
      .then((callback) => {
        if (callback?.ok) {
          toast.success("Đăng nhập thành công");
          router.refresh();
        }

        if (callback?.error) {
          toast.error(callback.error);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                Tên đăng nhập
              </FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                  placeholder="Nhâp tên đăng nhập..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                Mật khẩu
              </FormLabel>
              <FormControl>
                <InputIcon
                  icon={isShowPass ? EyeOff : Eye}
                  side="right"
                  disabled={isLoading}
                  type={isShowPass ? "text" : "password"}
                  className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                  placeholder="Nhâp mật khẩu..."
                  onClickIcon={() => setIsShowPass((value) => (value = !value))}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="outline" disabled={isLoading}>
          Đăng nhập
        </Button>
      </form>
    </Form>
  );
};
