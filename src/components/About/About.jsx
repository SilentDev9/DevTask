import { Link } from "react-router-dom";
import BottomNav from "../BottomNav/BottomNav";
import styles from "./InfoPages.module.css";
import { useLanguage, translate } from "../../context/LanguageContext";
export default function About() {
  const { language } = useLanguage();
  const t = (en, fa) => translate(language, en, fa);
  return (
    <>
      <main className={styles.page}>
        <div className={styles.container}>
          <header>
            <Link to="/home" className={styles.brand}>
              <i className="fa fa-layer-group" /> DevTask
            </Link>
            <span>{t("ABOUT US", "درباره ما")}</span>
            <h1>
              {t(
                "Make your work feel manageable.",
                "کارهایتان را ساده‌تر مدیریت کنید.",
              )}
            </h1>
            <p>
              {t(
                "DevTask is a focused task-management workspace designed to help you organize priorities, follow deadlines, and see your progress without unnecessary clutter.",
                "DevTask فضایی برای مدیریت تسک‌هاست تا اولویت‌ها را مرتب کنید، مهلت‌ها را دنبال کنید و پیشرفت خود را بدون شلوغی ببینید.",
              )}
            </p>
            <Link className={styles.primary} to="/tasks">
              {t("Explore your tasks", "مشاهده تسک‌ها")}{" "}
              <i className="fa fa-arrow-right" />
            </Link>
          </header>
          <section className={styles.cards}>
            <article>
              <i className="fa fa-bullseye" />
              <h2>{t("Clarity", "شفافیت")}</h2>
              <p>
                {t(
                  "Keep important work visible and break larger goals into clear next steps.",
                  "کارهای مهم را در دسترس نگه دارید و هدف‌های بزرگ را به گام‌های کوچک تقسیم کنید.",
                )}
              </p>
            </article>
            <article>
              <i className="fa fa-calendar-check-o" />
              <h2>{t("Consistency", "پیوستگی")}</h2>
              <p>
                {t(
                  "Track due dates and task status so you can build a steady working rhythm.",
                  "تاریخ‌ها و وضعیت تسک‌ها را دنبال کنید تا روند کاری منظمی داشته باشید.",
                )}
              </p>
            </article>
            <article>
              <i className="fa fa-line-chart" />
              <h2>{t("Progress", "پیشرفت")}</h2>
              <p>
                {t(
                  "Use your dashboard and statistics to understand what you have accomplished.",
                  "با داشبورد و آمار، میزان پیشرفت خود را بررسی کنید.",
                )}
              </p>
            </article>
          </section>
          <footer>DevTask · {t("Your personal productivity workspace", "فضای شخصی شما برای مدیریت و بهره‌وری")}</footer>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
