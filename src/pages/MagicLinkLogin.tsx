import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function MagicLinkLogin() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "sent" | "token">("email");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call the backend to generate and send magic link
      const response = await fetch("/api/magic-link/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setStep("sent");
        // For demo purposes, show the token if provided
        if (data.token) {
          setToken(data.token);
        }
      } else {
        setError(data.message || "Failed to send magic link");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUseMagicLink = () => {
    if (token) {
      // Redirect to the magic link verification endpoint
      window.location.href = `/auth/magic?token=${token}`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Magic Link Login</h1>
          <p className="text-gray-600 mt-2">Passwordless authentication for SCHROOL</p>
        </div>

        {step === "email" && (
          <form onSubmit={handleRequestMagicLink} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="student@schrool.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Magic Link"
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Demo users: student@schrool.com, parent@schrool.com, teacher@schrool.com, admin@schrool.com
            </p>
          </form>
        )}

        {step === "sent" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>

            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-4">
                We've sent a magic link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Click the link in your email to log in. The link expires in 1 hour.
              </p>
            </div>

            {token && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Demo Token (for testing):</p>
                <code className="text-xs break-all font-mono text-gray-900">{token}</code>
                <Button
                  onClick={handleUseMagicLink}
                  className="w-full mt-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Use This Token"
                  )}
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setStep("email");
                setEmail("");
                setError("");
                setToken("");
              }}
            >
              Try Another Email
            </Button>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
