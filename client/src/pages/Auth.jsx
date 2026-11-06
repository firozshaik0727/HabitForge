
import { useState } from "react";
import {
  Activity,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { apiRequest } from "../api";

function Auth({ onLogin }) {
  const [view, setView] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = view === "register";

  const switchView = (nextView) => {
    setView(nextView);
    setError("");
    setInfo("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      if (view === "forgot") {
        setInfo(
          "Password reset email is not configured yet. Please contact the app administrator for account assistance."
        );
        return;
      }

      const endpoint = isRegister
        ? "/api/auth/register"
        : "/api/auth/login";

      const body = isRegister
        ? { name, email, password }
        : { email, password };

      const data = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      localStorage.setItem("habitforge_token", data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-visual">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Activity size={25} />
          </div>
          <span>HabitForge<span className="brand-period">.</span></span>
        </div>

        <div className="auth-visual-content">
          <span className="auth-kicker">
            <Sparkles size={14} /> YOUR PERSONAL GROWTH SPACE
          </span>

          <h1>
            Small steps.
            <br />
            <span>Remarkable</span>
            <br />
            progress.
          </h1>

          <p>
            Build better routines, stay consistent, and turn
            the person you want to be into the person you become.
          </p>

          <div className="auth-feature-list">
            <div>
              <CheckCircle2 size={18} />
              <span>Build habits that actually stick</span>
            </div>
            <div>
              <CheckCircle2 size={18} />
              <span>Track your daily progress</span>
            </div>
            <div>
              <CheckCircle2 size={18} />
              <span>Celebrate every milestone</span>
            </div>
          </div>
        </div>

        <div className="auth-visual-bottom">
          <div className="auth-orbit">
            <span>GROW</span>
            <strong>1%</strong>
            <small>EVERY DAY</small>
          </div>
          <p>Consistency creates the extraordinary.</p>
        </div>

        <div className="auth-decoration auth-decoration-one" />
        <div className="auth-decoration auth-decoration-two" />
      </section>

      <section className="auth-form-side">
        <div className="auth-mobile-brand">
          <Activity size={24} />
          <strong>HabitForge<span>.</span></strong>
        </div>

        <div className="auth-form-container" key={view}>
          {view === "forgot" ? (
            <>
              <button
                type="button"
                className="auth-back-button"
                onClick={() => switchView("login")}
              >
                <ArrowLeft size={17} /> Back to login
              </button>

              <div className="auth-heading">
                <div className="auth-heading-icon">
                  <Mail size={23} />
                </div>
                <span className="auth-kicker">ACCOUNT RECOVERY</span>
                <h2>Forgot your password?</h2>
                <p>
                  Enter your registered email address to begin
                  the account recovery process.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <label htmlFor="forgot-email">Email address</label>
                <div className="auth-input-wrap">
                  <Mail size={18} />
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {error && <div className="auth-error">{error}</div>}
                {info && <div className="auth-info">{info}</div>}

                <button
                  className="auth-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Please wait..." : "Continue"}
                  <ArrowRight size={18} />
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="auth-heading">
                <span className="auth-kicker">
                  {isRegister ? "START YOUR JOURNEY" : "WELCOME BACK"}
                </span>

                <h2>
                  {isRegister
                    ? "Create your account."
                    : "Good to see you again."}
                </h2>

                <p>
                  {isRegister
                    ? "Set up your account and start building better habits."
                    : "Sign in and keep your progress moving forward."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {isRegister && (
                  <>
                    <label htmlFor="auth-name">Full name</label>
                    <div className="auth-input-wrap">
                      <User size={18} />
                      <input
                        id="auth-name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        required
                      />
                    </div>
                  </>
                )}

                <label htmlFor="auth-email">Email address</label>
                <div className="auth-input-wrap">
                  <Mail size={18} />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="auth-password-heading">
                  <label htmlFor="auth-password">Password</label>

                  {!isRegister && (
                    <button
                      type="button"
                      className="auth-forgot"
                      onClick={() => switchView("forgot")}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="auth-input-wrap">
                  <Lock size={18} />
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={
                      isRegister ? "new-password" : "current-password"
                    }
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {error && <div className="auth-error">{error}</div>}
                {info && <div className="auth-info">{info}</div>}

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >
                  {loading
                    ? "Please wait..."
                    : isRegister
                      ? "Create my account"
                      : "Sign in to HabitForge"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              <div className="auth-switch">
                {isRegister
                  ? "Already have an account?"
                  : "New to HabitForge?"}

                <button
                  type="button"
                  onClick={() => switchView(isRegister ? "login" : "register")}
                >
                  {isRegister ? "Sign in" : "Create account"}
                </button>
              </div>
            </>
          )}

          <div className="auth-security">
            <ShieldCheck size={16} />
            <span>Your account information is securely handled.</span>
          </div>
        </div>

        <div className="auth-copyright">
          © {new Date().getFullYear()} HabitForge. Built for progress.
        </div>
      </section>
    </main>
  );
}

export default Auth;
