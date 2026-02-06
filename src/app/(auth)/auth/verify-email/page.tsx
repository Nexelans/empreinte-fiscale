"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else if (!email) {
      setStatus("error");
      setMessage("Token de vérification manquant");
    }
  }, [token, email]);

  const verifyEmail = async (token: string) => {
    try {
      const res = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Email vérifié avec succès ! Vous pouvez maintenant vous connecter.");
        setTimeout(() => router.push("/auth/login"), 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Le lien de vérification est invalide ou expiré");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Une erreur est survenue lors de la vérification");
    }
  };

  if (!token && email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Vérifiez votre email
            </h2>
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                Un email de vérification a été envoyé à <strong>{email}</strong>.
                Cliquez sur le lien dans l'email pour activer votre compte.
              </p>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Vous n'avez pas reçu l'email ? Vérifiez vos spams ou contactez le support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {status === "verifying" && (
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Vérification en cours...
            </h2>
            <p className="mt-2 text-sm text-gray-600">Veuillez patienter</p>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Email vérifié !</h2>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Erreur de vérification
            </h2>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
            <div className="mt-6">
              <Button onClick={() => router.push("/auth/register")}>
                Créer un nouveau compte
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
