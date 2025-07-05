import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";

interface LoginFormProps extends React.ComponentProps<"form"> {
  isLoading?: boolean;
  errorEmail?: string;
  errorPassword?: string;
  texts?: {
    title?: string;
    subtitle?: string;
    emailLabel?: string;
    passwordLabel?: string;
    forgotPassword?: string;
    loginButton?: string;
    loadingButton?: string;
  };
}

export function LoginForm({
  className,
  isLoading = false,
  errorEmail,
  errorPassword,
  texts = {},
  ...props
}: LoginFormProps) {
  const {
    title = "Login to your account",
    subtitle = "Enter your email below to login to your account",
    emailLabel = "Email",
    passwordLabel = "Password",
    forgotPassword = "Forgot your password?",
    loginButton = "Login",
    loadingButton = "Logging in...",
  } = texts;

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground text-sm text-balance">{subtitle}</p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">{emailLabel}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            disabled={isLoading}
            className={cn(errorEmail && "border-red-500")}
          />
          {errorEmail && <p className="text-red-500 text-sm">{errorEmail}</p>}
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">{passwordLabel}</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              {forgotPassword}
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={isLoading}
            className={cn(errorPassword && "border-red-500")}
          />
          {errorPassword && (
            <p className="text-red-500 text-sm">{errorPassword}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? loadingButton : loginButton}
        </Button>
      </div>
    </form>
  );
}
