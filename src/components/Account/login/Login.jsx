import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { supabase } from "../../../lib/supabase";
import Notification from "../../Notification/Notification";
import { useLanguage, translate } from "../../../context/LanguageContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isPersian = language === "fa";
  const t = (en, fa) => translate(language, en, fa);

  function showNotification(message, type) {
    setNotification({ message, type, id: Date.now() });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim()) {
      showNotification(t("Please enter your email address.", "لطفاً آدرس ایمیل خود را وارد کنید."), "warning");
      return;
    }
    if (!password) {
      showNotification(t("Please enter your password.", "لطفاً رمز عبور خود را وارد کنید."), "warning");
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("Login error:", error);
        if (error.message === "Invalid login credentials") {
          showNotification(t("Your email or password is incorrect.", "ایمیل یا رمز عبور اشتباه است."), "danger");
        } else if (error.message === "Email not confirmed") {
          showNotification(t("Please confirm your email before signing in.", "ابتدا ایمیل خود را تأیید کنید."), "warning");
        } else {
          showNotification(t("Sign-in failed. Please try again.", "ورود انجام نشد. لطفاً دوباره تلاش کنید."), "danger");
        }
        return;
      }

      if (data?.session) {
        showNotification(t("You are signed in successfully.", "با موفقیت وارد حساب خود شدید."), "success");
        navigate("/home", { replace: true });
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      showNotification(t("Could not connect to the server. Please try again.", "ارتباط با سرور برقرار نشد. دوباره تلاش کنید."), "danger");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.page} dir={isPersian ? "rtl" : "ltr"}>
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
            <i className="fa fa-layer-group" />
          </div>
          <span className={styles.eyebrow}>{t("DEVTASK ACCOUNT", "حساب کاربری DEVTASK")}</span>
          <h1 id="login-title">{t("Welcome back", "خوش برگشتید")}</h1>
          <p>{t("Sign in to continue to your workspace.", "برای ورود به فضای کاری خود، اطلاعات حساب را وارد کنید.")}</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.fieldLabel} htmlFor="login-email">{t("Email address", "آدرس ایمیل")}</label>
          <div className={styles.inputWrap}>
            <i className="fa fa-envelope" aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="example@email.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <label className={styles.fieldLabel} htmlFor="login-password">{t("Password", "رمز عبور")}</label>
          <div className={styles.inputWrap}>
            <i className="fa fa-lock" aria-hidden="true" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={t("Enter your password", "رمز عبور خود را وارد کنید")}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              className={styles.passwordToggle}
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? t("Hide password", "مخفی کردن رمز عبور") : t("Show password", "نمایش رمز عبور")}
              aria-pressed={showPassword}
            >
              <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
            </button>
          </div>

          <button className={styles.submitButton} type="submit" disabled={isLoading}>
            {isLoading ? t("Signing in...", "در حال ورود...") : t("Sign in", "ورود به حساب")}
            <i className={`fa ${isPersian ? "fa-arrow-left" : "fa-arrow-right"}`} aria-hidden="true" />
          </button>
        </form>

        <p className={styles.signupText} style={{ marginTop: 17, marginBottom: -14 }}>
          <Link to="/forgot-password">{t("Forgot password?", "رمز عبور را فراموش کرده‌اید؟")}</Link>
        </p>
        <p className={styles.signupText}>
          {t("Don't have an account?", "هنوز حساب کاربری ندارید؟")} <Link to="/register">{t("Create an account", "ایجاد حساب کاربری")}</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
