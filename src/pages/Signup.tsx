import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail } from "lucide-react";
import GoogleIcon from "@/assets/google.svg?react";
import AppleIcon from "@/assets/apple.svg?react";
import { Link } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

interface SignupPayload {
  email: string;
  password: string;
}

const signupSchema = z.object({
  email: z.email({ error: "The email must be a valid format. " }),
  password: z
    .string({
      error:
        "The password must be between 6-25 characters, include uppecarse an lowercase letter, number & special char",
    })
    .min(6, "The password must be min 6 chars")
    .max(25, "The password must be max 25 chars")
    .regex(/^(?=.*[A-Z]).{8,}$/g, {
      error:
        "The password must be between 6-25 characters, include uppecarse an lowercase letter, number & special char ",
    }),
});

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
  } = useForm<SignupPayload>({
    mode: "onChange",
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submitData: SubmitHandler<SignupPayload> = (data) => {
    try {
      signupSchema.parse(data);
      toast(`${data.email} has been signed correctly`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast(error.issues.map((err) => err.message).join(", "));
      } else {
        toast(String(error));
      }
    }
  };

  return (
    <>
      <div className="min-h-screen w-full bg-black absolute overflow-hidden">
        {/* Top Spotlight Background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
       radial-gradient(
         circle at top,
         rgba(255, 255, 255, 0.08) 0%,
         rgba(255, 255, 255, 0.08) 20%,
         rgba(0, 0, 0, 0.0) 60%
       )
     `,
          }}
        />
        {/* Your Content Here */}
      </div>
      <div className="mx-auto max-w-75 pt-50 relative z-2">
        <h3
          className="text-2xl mb-8 text-center uppercase"
          style={{ fontFamily: `"Funnel Display", sans-serif` }}
        >
          Signup
        </h3>
        <p className="mb-8 block text-zinc-300 text-center text-sm">
          Sign up fast. Get full access. No credit card needed. Start now.
        </p>

        <form id="signup" onSubmit={handleSubmit(submitData)} autoComplete="off">
          <div className="flex flex-col gap-1 mb-10">
            <Button className="w-full p-2 h-auto cursor-pointer">
              <GoogleIcon />
              Signup with Google
            </Button>
            <Button className="w-full p-2 h-auto cursor-pointer">
              <AppleIcon />
              Signup with Apple
            </Button>
          </div>

          <div className="mb-5">
            <label htmlFor="fullname" aria-label="Full Name" className="mb-1 block text-zinc-300">
              {dirtyFields.email && (
                <span className="text-red-500 text-sm inline-block mr-1">*</span>
              )}
              Email
            </label>
            <div className="relative w-auto">
              <Mail className="text-zinc-300 absolute top-[50%] translate-y-[-50%] left-2.5 w-4 h-4" />
              <Input
                className="w-75 p-2 h-auto pl-8"
                id="fullname"
                {...register("email")}
                autoComplete="off"
                autoFocus
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>}
          </div>

          <div className="mb-5">
            <label htmlFor="password" aria-label="Password" className="mb-1 block text-zinc-300">
              {dirtyFields.password && (
                <span className="text-red-500 text-sm inline-block mr-1">*</span>
              )}
              Password
            </label>

            <div className="relative w-auto">
              <KeyRound className="text-zinc-300 absolute top-[50%] translate-y-[-50%] left-2.5 w-4 h-4" />
              <Input
                className="w-75 p-2 h-auto pl-8"
                id="password"
                type="password"
                autoComplete="off"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>
            )}
          </div>

          <Button className="w-full p-2 h-auto cursor-pointer" disabled={!isValid}>
            Register
          </Button>
          <Link to="/login" className="block mt-2 text-sm underline text-right">
            Do you already have account?
          </Link>
        </form>
      </div>
    </>
  );
}
