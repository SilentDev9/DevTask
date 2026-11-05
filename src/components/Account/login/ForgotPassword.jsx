import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./AuthRecovery.module.css";
import { supabase } from "../../../lib/supabase";
import { useLanguage, translate } from "../../../context/LanguageContext";
import Notification from "../../Notification/Notification";

export default function ForgotPassword() {
  const { language } = useLanguage();
  const t = (en, fa) => translate(language, en, fa);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  async function submit(event) {
    event.preventDefault();
    if (!email.trim()) { setNotice({ text:t("Enter your account email.", "ایمیل حساب خود را وارد کنید."), type:"warning" }); return; }
    setLoading(true);
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setLoading(false);
    setNotice(error
      ? { text:t("Could not send the recovery email. Check your email settings and try again.", "ارسال ایمیل بازیابی انجام نشد. تنظیمات ایمیل را بررسی کنید."), type:"danger" }
      : { text:t("If this email belongs to an account, a recovery link has been sent.", "اگر این ایمیل متعلق به حسابی باشد، لینک بازیابی ارسال شده است."), type:"success" });
  }

  return <main className={styles.page} dir={language === "fa" ? "rtl" : "ltr"}>
    {notice && <Notification message={notice.text} type={notice.type} onClose={() => setNotice(null)} duration={5500} />}
    <section className={styles.card}>
      <div className={styles.logo}><i className="fa fa-key" /></div>
      <span className={styles.eyebrow}>DEVTASK ACCOUNT</span>
      <h1>{t("Forgot password?", "رمز عبور را فراموش کرده‌اید؟")}</h1>
      <p>{t("Enter the email address linked to your account. We will send a password recovery link.", "ایمیل متصل به حساب خود را وارد کنید تا لینک بازیابی برایتان ارسال شود.")}</p>
      <form onSubmit={submit}>
        <label htmlFor="recovery-email">{t("Email address", "آدرس ایمیل")}</label>
        <input id="recovery-email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@email.com" />
        <button disabled={loading}>{loading ? t("Sending...", "در حال ارسال...") : t("Send recovery link", "ارسال لینک بازیابی")}</button>
      </form>
      <Link className={styles.backLink} to="/login"><i className="fa fa-arrow-left" /> {t("Back to sign in", "بازگشت به ورود")}</Link>
    </section>
  </main>;
}
