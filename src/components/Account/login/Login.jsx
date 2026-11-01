import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import styles from "./Login.module.css";
import { supabase } from "../../../lib/supabase";
import Notification from "../../Notification/Notification";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [notification, setNotification] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  function showNotification(message, type) {
    setNotification({
      message,
      type,
      id: Date.now(),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim()) {
      showNotification("لطفاً ایمیل خود را وارد کنید.", "warning");
      return;
    }

    if (!password) {
      showNotification("لطفاً رمز عبور را وارد کنید.", "warning");
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error("Login error:", error);

        if (error.message === "Invalid login credentials") {
          showNotification("ایمیل یا رمز عبور اشتباه است.", "danger");
        } else if (error.message === "Email not confirmed") {
          showNotification("ابتدا ایمیل خود را تأیید کنید.", "warning");
        } else {
          showNotification("ورود انجام نشد. لطفاً دوباره تلاش کنید.", "danger");
        }

        return;
      }

      if (data.session) {
        showNotification("ورود با موفقیت انجام شد.", "success");

        navigate("/home");
      }
    } catch (error) {
      console.error("Unexpected login error:", error);

      showNotification(
        "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
        "danger",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      {notification && (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={4000}
        />
      )}

      <section className={styles.loginCard} aria-labelledby="login-title">
        <header className={styles.headerForm}>
          <div className={styles.logo} aria-hidden="true">
            &lt;/&gt;
          </div>

          <h1 id="login-title">Welcome Back</h1>

          <p>Sign in to your DevTask account</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.inputWrap}>
            <i className="fa fa-envelope" aria-hidden="true" />

            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              aria-label="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className={styles.inputWrap}>
            <i className="fa fa-lock" aria-hidden="true" />

            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              aria-label="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <span className={styles.passwordHint} aria-hidden="true">
              <i className="fa fa-eye" />
            </span>
          </label>

          <button
            className={styles.submitButton}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          <div className={styles.divider}>
            <span>or continue with</span>
          </div>
        </form>

        <div className={styles.socialButtons}>
          <button type="button" aria-label="Continue with Google">
            <i className="fa fa-google" aria-hidden="true" />
          </button>

          <button type="button" aria-label="Continue with GitHub">
            <i className="fa fa-github" aria-hidden="true" />
          </button>
        </div>

        <p className={styles.signupText}>
          Don&apos;t have an account? <Link to="/register">Sign Up </Link>
          <span>or</span> <Link to="/home">free accout</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
