import { useState } from "react";
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

  function showNotification(message, type) {
    setNotification({ message, type, id: Date.now() });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!userName.trim()) {
      showNotification("نام و نام خانوادگی را وارد کنید.", "danger");
      return;
    }

    if (!email.trim()) {
      showNotification("لطفاً ایمیل خود را وارد کنید.", "warning");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      showNotification("فرمت ایمیل واردشده صحیح نیست.", "danger");
      return;
    }

    if (!password) {
      showNotification("رمز عبور را وارد کنید.", "warning");
      return;
    }

    if (password.length < 8) {
      showNotification("رمز عبور باید حداقل ۸ کاراکتر داشته باشد.", "warning");
      return;
    }

    if (!confirmPassword) {
      showNotification("تکرار رمز عبور را وارد کنید.", "warning");
      return;
    }

    if (password !== confirmPassword) {
      showNotification("رمز عبور و تکرار آن یکسان نیستند.", "danger");
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
            "محدودیت ارسال درخواست یا ایمیل فعال شده است. کمی بعد دوباره تلاش کنید.",
            "warning",
          );
        } else {
          showNotification(
            "ثبت‌نام انجام نشد. اطلاعات را بررسی کنید و دوباره تلاش کنید.",
            "danger",
          );
        }
        return;
      }

      if (data?.session) {
        showNotification("ثبت‌نام با موفقیت انجام شد!", "success");
      } else if (data?.user) {
        showNotification(
          "حساب ایجاد شد. اگر تأیید ایمیل فعال است، صندوق ورودی ایمیل خود را بررسی کنید.",
          "info",
        );
      } else {
        showNotification(
          "پاسخ ثبت‌نام کامل نبود. لطفاً دوباره تلاش کنید.",
          "danger",
        );
      }
    } catch (error) {
      console.error("Unexpected registration error:", error);
      showNotification(
        "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
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

      <div className={styles.registerCard}>
        <h1>ایجاد حساب کاربری</h1>
        <p className={styles.subtitle}>برای شروع، اطلاعات خود را وارد کنید.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.inputGroup}>
            <label htmlFor="fullName">نام و نام خانوادگی</label>
            <input
              type="text"
              id="fullName"
              placeholder="نام خود را وارد کنید"
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              autoComplete="name"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">ایمیل</label>
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
            <label htmlFor="password">رمز عبور</label>
            <input
              type="password"
              id="password"
              placeholder="حداقل ۸ کاراکتر"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">تکرار رمز عبور</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="رمز عبور را دوباره وارد کنید"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className={styles.registerButton}
            disabled={isLoading}
          >
            {isLoading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
          </button>
        </form>

        <p className={styles.loginText}>
          قبلاً حساب ساخته‌اید؟ <a href="/login">وارد شوید</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
