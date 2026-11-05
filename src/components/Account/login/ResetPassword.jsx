import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./AuthRecovery.module.css";
import { supabase } from "../../../lib/supabase";
import { useLanguage, translate } from "../../../context/LanguageContext";
import Notification from "../../Notification/Notification";

export default function ResetPassword() {
  const { language } = useLanguage();
  const t = (en, fa) => translate(language, en, fa);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  async function submit(event) {
    event.preventDefault();
    if (password.length < 8) { setNotice({text:t("Use at least 8 characters.", "رمز عبور باید حداقل ۸ کاراکتر باشد."),type:"warning"}); return; }
    if (password !== confirm) { setNotice({text:t("Passwords do not match.", "رمزهای عبور یکسان نیستند."),type:"warning"}); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    setNotice(error
      ? {text:t("The recovery session is invalid or expired. Request a new link.", "لینک بازیابی نامعتبر یا منقضی شده است. دوباره درخواست دهید."),type:"danger"}
      : {text:t("Password updated. You can now sign in with your new password.", "رمز عبور تغییر کرد. اکنون می‌توانید وارد شوید."),type:"success"});
    if (!error) setTimeout(() => { window.location.href = `${import.meta.env.BASE_URL}login`; }, 1400);
  }

  return <main className={styles.page} dir={language === "fa" ? "rtl" : "ltr"}>
    {notice && <Notification message={notice.text} type={notice.type} onClose={() => setNotice(null)} duration={5000} />}
    <section className={styles.card}>
      <div className={styles.logo}><i className="fa fa-lock" /></div>
      <span className={styles.eyebrow}>DEVTASK ACCOUNT</span>
      <h1>{t("Set a new password", "تنظیم رمز عبور جدید")}</h1>
      <p>{t("Choose a strong password with at least 8 characters.", "یک رمز عبور قوی با حداقل ۸ کاراکتر انتخاب کنید.")}</p>
      <form onSubmit={submit}>
        <label htmlFor="new-password">{t("New password", "رمز عبور جدید")}</label>
        <input id="new-password" type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} />
        <label htmlFor="confirm-new-password">{t("Confirm password", "تکرار رمز عبور")}</label>
        <input id="confirm-new-password" type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} />
        <button disabled={loading}>{loading ? t("Updating...", "در حال تغییر...") : t("Update password", "تغییر رمز عبور")}</button>
      </form>
      <Link className={styles.backLink} to="/login">{t("Back to sign in", "بازگشت به ورود")}</Link>
    </section>
  </main>;
}
