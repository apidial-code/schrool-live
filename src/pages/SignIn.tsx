import React, { useEffect, useRef, useState } from "react";
import { trpc } from "../lib/trpc";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [token, setToken] = useState(() => {
    const values = new URLSearchParams(window.location.hash.slice(1))
      .getAll("token");
    return values.length === 1 && /^[a-f0-9]{64}$/.test(values[0])
      ? values[0] : "";
  });

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const locked = useRef(false);

  const request = trpc.auth.requestSignIn.useMutation({ retry: false });
  const verify = trpc.auth.verifySignIn.useMutation({ retry: false });

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(window.history.state, "", "/login");
    }
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (locked.current) return;

    locked.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const result = await request.mutateAsync({
        email: email.trim(),
        rememberDevice,
      });
      setMessage(result.message);
    } catch {
      setError("Unable to request a sign-in link. Please try again shortly.");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function confirmSignIn() {
    if (locked.current || !token) return;

    locked.current = true;
    setBusy(true);
    setError("");

    try {
      const result = await verify.mutateAsync({ token });
      const allowed = ["/student", "/parent", "/teacher", "/admin", "/"];

      window.location.replace(
        allowed.includes(result.redirectTo) ? result.redirectTo : "/"
      );
    } catch {
      setError(
        "Unable to sign in. The link may have expired or already been used. You can request a new link below."
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return (
    <main style={{
      maxWidth: 480,
      margin: "64px auto",
      padding: 24,
      fontFamily: "sans-serif",
      lineHeight: 1.6,
    }}>
      <h1 style={{ color: "#1560B0" }}>Schrool sign in</h1>

      {error && (
        <p role="alert" style={{ color: "#a31616" }}>{error}</p>
      )}

      {token ? (
        <section>
          <p>Continue to sign in using the link from your email.</p>

          <button
            type="button"
            disabled={busy}
            onClick={confirmSignIn}
          >
            {busy ? "Signing in..." : "Confirm sign in"}
          </button>

          <p>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setToken("");
                setError("");
              }}
            >
              Request a new link instead
            </button>
          </p>
        </section>
      ) : (
        <form onSubmit={submit}>
          <p>
            Enter your account email. We will email you a one-time
            sign-in link.
          </p>

          <label htmlFor="sign-in-email">Email address</label>
          <input
            id="sign-in-email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            disabled={busy}
            onChange={(event) => setEmail(event.target.value)}
            style={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              padding: 12,
              margin: "8px 0 20px",
            }}
          />

          <label style={{ display: "block", marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={rememberDevice}
              disabled={busy}
              onChange={(event) =>
                setRememberDevice(event.target.checked)
              }
            />
            {" "}Keep me signed in on this device
          </label>

          <p style={{ fontSize: 14 }}>
            For family accounts on a personal device only.
            Leave unchecked on shared devices.
            Staff sessions last up to eight hours.
          </p>

          <button type="submit" disabled={busy}>
            {busy ? "Requesting link..." : "Email me a sign-in link"}
          </button>

          {message && <p role="status">{message}</p>}
        </form>
      )}

      <p><a href="/">Return to home</a></p>
    </main>
  );
}
