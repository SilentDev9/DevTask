import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import BottomNav from "../BottomNav/BottomNav";
import styles from "./Profile.module.css";
import { useLanguage, translate } from "../../context/LanguageContext";
import { useTheme, themes, backgrounds } from "../../context/ThemeContext";

function Profile() {
  const { language } = useLanguage();
  const { theme, setTheme, background, setBackground } = useTheme();
  const t = (en, fa) => translate(language, en, fa);
  const formatNumber = (value) => new Intl.NumberFormat(language === "fa" ? "fa-IR" : "en-US").format(value);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [taskCount, setTaskCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUser(data.user);
        const { data: taskData } = await supabase
          .from("tasks")
          .select("status");
        const rows = taskData || [];
        setTaskCount(rows.length);
        setCompletedCount(
          rows.filter((task) => task.status === "completed").length,
        );
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.userName ||
    user?.email?.split("@")[0] ||
    t("DevTask User", "کاربر DevTask");
  const initial = name.charAt(0).toUpperCase();

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate("/login", { replace: true });
  }

  return (
    <>
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.heading}>
            <div>
              <span>{t("ACCOUNT", "حساب کاربری")}</span>
              <h1>{t("My Profile", "پروفایل من")}</h1>
              <p>
                {t(
                  "Manage your personal workspace.",
                  "فضای کاری شخصی خود را مدیریت کنید.",
                )}
              </p>
            </div>
            <Link to="/home">
              {t("Dashboard", "داشبورد")} <i className="fa fa-arrow-right" />
            </Link>
          </header>
          {loading ? (
            <p className={styles.loading}>
              {t("Loading profile...", "در حال بارگذاری پروفایل...")}
            </p>
          ) : (
            <>
              <section className={styles.hero}>
                <div className={styles.avatar}>{initial}</div>
                <div>
                  <h2>{name}</h2>
                  <p>{user?.email || t("No email available", "ایمیلی ثبت نشده است")}</p>
                  <span className={styles.member}>
                    {" "}
                    <i className="fa fa-shield" /> {t("Personal account", "حساب شخصی")}
                  </span>
                </div>
              </section>
              <section className={styles.stats}>
                <article>
                  <span>{t("Tasks created", "تسک‌های ایجادشده")}</span>
                  <strong>{formatNumber(taskCount)}</strong>
                </article>
                <article>
                  <span>{t("Tasks completed", "تسک‌های تکمیل‌شده")}</span>
                  <strong>{formatNumber(completedCount)}</strong>
                </article>
                <article>
                  <span>{t("Completion", "میزان تکمیل")}</span>
                  <strong>
                    {taskCount
                      ? formatNumber(Math.round((completedCount / taskCount) * 100))
                      : formatNumber(0)}
                    %
                  </strong>
                </article>
              </section>
              <section className={styles.customization}>
                <div className={styles.customizationHeading}>
                  <span className={styles.customizationIcon}><i className="fa fa-palette" /></span>
                  <div>
                    <h2>{t("Appearance", "شخصی‌سازی ظاهر")}</h2>
                    <p>{t("Choose a color theme and an animated background.", "رنگ‌بندی و پس‌زمینه دلخواه خود را انتخاب کنید.")}</p>
                  </div>
                </div>
                <h3>{t("Color themes", "قالب‌های رنگی")}</h3>
                <div className={styles.themeGrid}>
                  {themes.map((item) => <button key={item.id} type="button" onClick={() => setTheme(item.id)} className={`${styles.themeChoice} ${theme === item.id ? styles.selectedTheme : ""}`} aria-pressed={theme === item.id}>
                    <span className={styles.themeSwatch} style={{ "--swatch": item.color }} />
                    <span>{language === "fa" ? item.label : item.name}</span>
                    {theme === item.id && <i className="fa fa-check" />}
                  </button>)}
                </div>
                <h3>{t("Animated backgrounds", "پس‌زمینه‌های متحرک")}</h3>
                <div className={styles.backgroundGrid}>
                  {backgrounds.map((item) => <button key={item.id} type="button" onClick={() => setBackground(item.id)} className={`${styles.backgroundChoice} ${background === item.id ? styles.selectedBackground : ""}`} aria-pressed={background === item.id}>
                    <span className={`${styles.backgroundPreview} ${styles["preview_" + item.id]}`}><i className="fa fa-sparkles" /></span>
                    <span>{language === "fa" ? item.label : item.name}</span>
                    {background === item.id && <i className="fa fa-check" />}
                  </button>)}
                </div>
              </section>
              <section className={styles.account}>
                <h2>{t("Account information", "اطلاعات حساب")}</h2>
                <div>
                  <span>{t("Display name", "نام نمایشی")}</span>
                  <strong>{name}</strong>
                </div>
                <div>
                  <span>{t("Email address", "آدرس ایمیل")}</span>
                  <strong>{user?.email || "—"}</strong>
                </div>
                <div>
                  <span>{t("Account created", "تاریخ ایجاد حساب")}</span>
                  <strong>
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString(language === "fa" ? "fa-IR-u-ca-persian" : "en-US")
                      : "—"}
                  </strong>
                </div>
                <button onClick={signOut}>
                  <i className="fa fa-sign-out" /> {t("Sign out", "خروج از حساب")}
                </button>
              </section>
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
export default Profile;
