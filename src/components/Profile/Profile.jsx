import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import BottomNav from "../BottomNav/BottomNav";
import styles from "./Profile.module.css";
import { useLanguage, translate } from "../../context/LanguageContext";

function Profile() {
  const { language } = useLanguage();
  const t = (en, fa) => translate(language, en, fa);
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
    "DevTask User";
  const initial = name.charAt(0).toUpperCase();

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) window.location.assign("/login");
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
              Dashboard <i className="fa fa-arrow-right" />
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
                  <p>{user?.email || "No email available"}</p>
                  <span className={styles.member}>
                    {" "}
                    <i className="fa fa-shield" /> Personal account
                  </span>
                </div>
              </section>
              <section className={styles.stats}>
                <article>
                  <span>{t("Tasks created", "تسک‌های ایجادشده")}</span>
                  <strong>{taskCount}</strong>
                </article>
                <article>
                  <span>{t("Tasks completed", "تسک‌های تکمیل‌شده")}</span>
                  <strong>{completedCount}</strong>
                </article>
                <article>
                  <span>{t("Completion", "میزان تکمیل")}</span>
                  <strong>
                    {taskCount
                      ? Math.round((completedCount / taskCount) * 100)
                      : 0}
                    %
                  </strong>
                </article>
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
                      ? new Date(user.created_at).toLocaleDateString()
                      : "—"}
                  </strong>
                </div>
                <button onClick={signOut}>
                  <i className="fa fa-sign-out" /> Sign out
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
