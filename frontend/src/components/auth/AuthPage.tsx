"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authRequest, saveAuth, type AuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "login" | "register";

type FormState = {
  nama: string;
  nim: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type AuthPageProps = {
  mode: AuthMode;
};

const initialFormState: FormState = {
  nama: "",
  nim: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isLogin = mode === "login";
  const successEmail = searchParams.get("email") ?? "";
  const registered = searchParams.get("registered") === "1";

  useEffect(() => {
    if (successEmail) {
      setFormState((current) => ({ ...current, email: successEmail }));
    }
    if (registered) {
      setSuccessMessage("Registrasi berhasil! Silakan masuk ke akun Anda.");
    }
  }, [successEmail, registered]);

  const updateField = (field: keyof FormState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isLogin && formState.password !== formState.confirmPassword) {
      setErrorMessage("Konfirmasi password tidak sama.");
      return;
    }

    setSubmitting(true);

    try {
      if (isLogin) {
        const response = await authRequest<{
          message?: string;
          token: string;
          user: AuthUser;
        }>("/auth/login", {
          email: formState.email.trim(),
          password: formState.password,
        });

        saveAuth({ token: response.token, user: response.user });
        router.push("/profile");
        return;
      }

      await authRequest("/auth/register", {
        nama: formState.nama.trim(),
        nim: formState.nim.trim(),
        email: formState.email.trim(),
        password: formState.password,
      });

      router.push(
        `/login?registered=1&email=${encodeURIComponent(formState.email.trim())}`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tak terduga.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {isLogin ? "Masuk" : "Daftar"}
          </h1>
          <p className="text-sm text-gray-600">
            {isLogin
              ? "Masuk ke akun Anda untuk melanjutkan"
              : "Buat akun baru untuk memulai"}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field (Register only) */}
          {!isLogin && (
            <div>
              <Label htmlFor="nama" className="mb-2 block text-sm font-medium">
                Nama Lengkap
              </Label>
              <Input
                id="nama"
                type="text"
                value={formState.nama}
                onChange={(event) => updateField("nama", event.target.value)}
                placeholder="Contoh: Andi Pratama"
                required={!isLogin}
              />
            </div>
          )}

          {/* NIM Field (Register only) */}
          {!isLogin && (
            <div>
              <Label htmlFor="nim" className="mb-2 block text-sm font-medium">
                NIM
              </Label>
              <Input
                id="nim"
                type="text"
                value={formState.nim}
                onChange={(event) => updateField("nim", event.target.value)}
                placeholder="23/xxxxx/TK/xxxxx"
                required={!isLogin}
              />
            </div>
          )}

          {/* Email Field */}
          <div>
            <Label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formState.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="nama@domain.ac.id"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <Label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formState.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                placeholder="Minimal 8 karakter"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Register only) */}
          {!isLogin && (
            <div>
              <Label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium"
              >
                Konfirmasi Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formState.confirmPassword}
                  onChange={(event) =>
                    updateField("confirmPassword", event.target.value)
                  }
                  placeholder="Ulangi password Anda"
                  required={!isLogin}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
          </Button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
          <Link
            href={isLogin ? "/register" : "/login"}
            className="font-medium text-emerald-600 hover:text-emerald-700"
          >
            {isLogin ? "Daftar di sini" : "Masuk di sini"}
          </Link>
        </div>
      </div>
    </div>
  );
}
