"use client";

import { api } from "@/lib/api";
import {
  Button,
  FormControl,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

export const SignUpForm = () => {
  const [response, action, isPending] = useActionState(
    async (prevState: any, queryData: any) => {
      const email: string = queryData.get("email");
      const password: string = queryData.get("password");

      const res = await api.auth.sign_in.post({
        email,
        password,
      });

      if (res.data?.error) {
        return {
          type: "error",
          message: res.error,
        };
      }
      return {
        type: "success",
        message: "Signed up successfully",
      };
    },
    null,
  );

  const [showPwd, setShowPwd] = useState<boolean>(false);
  const showPwdBtn = () => {
    return (
      <InputAdornment position="end">
        <button type="button" onClick={() => setShowPwd(!showPwd)}>
          {showPwd ? <EyeIcon /> : <EyeClosedIcon />}
        </button>
      </InputAdornment>
    );
  };

  const router = useRouter();
  useEffect(() => {
    if (response?.type === "success") {
      router.push("/agency");
    }
  }, [response]);

  return (
    <div className="app-container">
      <form action={action} className="flex flex-col gap-4">
        <OutlinedInput
          id="email"
          name="email"
          type="email"
          placeholder="Email"
        />
        <FormControl>
          <OutlinedInput
            id="password"
            name="password"
            type={showPwd ? "text" : "password"}
            placeholder="Password"
            endAdornment={showPwdBtn()}
          />
        </FormControl>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Signing Up..." : "Sign Up"}
        </Button>

        {response && response.type === "error" && (
          <div className="text-red-500">{response.message}</div>
        )}
      </form>
    </div>
  );
};
