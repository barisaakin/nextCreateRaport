'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export function LoginForm({
  className,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      document.cookie = `token=${res.accessToken}; path=/; max-age=86400`;
      toast.success("Giriş başarılı!");
      window.location.href = "/";
    } catch (err) {
      let errorMsg = "Giriş başarısız.";
      if (err?.response?.data?.message === "Invalid credentials") {
        errorMsg = "E-posta adresi veya şifre hatalı.";
      }
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">LOGIN</CardTitle>
          <div className="flex justify-center py-2">
            <img src="/logo.png" alt="Logo" className="h-20 w-auto" onError={e => { e.target.style.display = 'none'; }} />
          </div>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center relative">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <IconEyeOff size={20} />
                    ) : (
                      <IconEye size={20} />
                    )}
                  </button>
                </div>
              </div>
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
