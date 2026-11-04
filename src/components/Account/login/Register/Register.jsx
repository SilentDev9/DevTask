import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage, translate } from "../../../../context/LanguageContext";
import styles from "./Register.module.css";
import { supabase } from "../../../../lib/supabase";
import Notification from "../../../Notification/Notification";

function Register() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { language } = useLanguage();
  const fa = language === "fa";
  const t = (en, faText) => translate(language, en, faText);

  function showNotification(message, type) {
    setNotification({ message, type, id: Date.now() });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!userName.trim()) {
      showNotification(t("Please enter your full name.", "نام و نام خانوادگی را وارد کنید."), "danger");
      return;
    }

    if (!email.trim()) {
      showNotification(t("Please enter your email address.", "لطفاً ایمیل خود را وارد کنید."), "warning");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      showNotification(t("The email address format is invalid.", "فرمت ایمیل واردشده صحیح نیست."), "danger");
      return;
    }

    if (!password) {
      showNotification(t("Please enter a password.", "رمز عبور را وارد کنید."), "warning");
      return;
    }

    if (password.length < 8) {
      showNotification(t("Password must contain at least 8 characters.", "رمز عبور باید حداقل ۸ کاراکتر داشته باشد."), "warning");
      return;
    }

    if (!confirmPassword) {
      showNotification(t("Please confirm your password.", "تکرار رمز عبور را وارد کنید."), "warning");
      return;
    }

    if (password !== confirmPassword) {
      showNotification(t("The passwords do not match.", "رمز عبور و تکرار آن یکسان نیستند."), "danger");
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: userName.trim(),
          },
        },
      });

      // Supabase errors are returned in `error`; they do not necessarily throw.
      if (error) {
        console.error("Registration error:", error);

        if (error.message.toLowerCase().includes("rate limit")) {
          showNotification(
            t("The email request limit has been reached. Please try again later.", "محدودیت ارسال درخواست یا ایمیل فعال شده است. کمی بعد دوباره تلاش کنید."),
            "warning",
          );
        } else {
          showNotification(
            t("Sign-up failed. Check your details and try again.", "ثبت‌نام انجام نشد. اطلاعات را بررسی کنید و دوباره تلاش کنید."),
            "danger",
          );
        }
        return;
      }

      if (data?.session) {
        showNotification(t("Your account was created successfully!", "حساب کاربری با موفقیت ایجاد شد!"), "success");
      } else if (data?.user) {
        showNotification(
          t("Your account was created. Check your inbox if email confirmation is enabled.", "حساب ایجاد شد. اگر تأیید ایمیل فعال است، صندوق ورودی ایمیل خود را بررسی کنید."),
          "info",
        );
      } else {
        showNotification(
          t("The sign-up response was incomplete. Please try again.", "پاسخ ثبت‌نام کامل نبود. لطفاً دوباره تلاش کنید."),
          "danger",
        );
      }
    } catch (error) {
      console.error("Unexpected registration error:", error);
      showNotification(
        t("Could not connect to the server. Please try again.", "ارتباط با سرور برقرار نشد. دوباره تلاش کنید."),
        "danger",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      {notification && (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={4000}
        />
      )}

      <div className={styles.registerCard} dir={fa ? "rtl" : "ltr"}>
        <div className={styles.brandMark}><i className="fa fa-check-square" aria-hidden="true" /></div>
        <p className={styles.eyebrow}>{t("DEVTASK ACCOUNT", "حساب کاربری DEVTASK")}</p>
        <h1>{t("Create your account", "ایجاد حساب کاربری")}</h1>
        <p className={styles.subtitle}>{t("A focused workspace for everything you want to get done.", "فضایی منظم برای برنامه‌ریزی و انجام کارهای مهم شما.")}</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.inputGroup}>
            <label htmlFor="fullName">{t("Full name", "نام و نام خانوادگی")}</label>
            <input
              type="text"
              id="fullName"
              placeholder={t("Enter your name", "نام خود را وارد کنید")}
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              autoComplete="name"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">{t("Email address", "ایمیل")}</label>
            <input
              type="email"
              id="email"
              placeholder="example@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">{t("Password", "رمز عبور")}</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder={t("At least 8 characters", "حداقل ۸ کاراکتر")}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
            <button className={styles.passwordToggle} type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? t("Hide password", "مخفی کردن رمز") : t("Show password", "نمایش رمز")}><i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} /></button>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">{t("Confirm password", "تکرار رمز عبور")}</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder={t("Enter your password again", "رمز عبور را دوباره وارد کنید")}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
            <button className={styles.passwordToggle} type="button" onClick={() => setShowConfirmPassword(v => !v)} aria-label={showConfirmPassword ? t("Hide password", "مخفی کردن رمز") : t("Show password", "نمایش رمز")}><i className={`fa ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`} /></button>
          </div>

          <button
            type="submit"
            className={styles.registerButton}
            disabled={isLoading}
          >
            {isLoading ? t("Creating account...", "در حال ثبت‌نام...") : t("Create account", "ایجاد حساب")}
          </button>
        </form>

        <p className={styles.loginText}>
          {t("Already have an account?", "قبلاً حساب ساخته‌اید؟")} <Link to="/login">{t("Sign in", "وارد شوید")}</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
