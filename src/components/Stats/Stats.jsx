import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import BottomNav from "../BottomNav/BottomNav";
import styles from "./Stats.module.css";
import { useLanguage, translate } from "../../context/LanguageContext";


function MetricIcon({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 22,
    height: 22,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    focusable: "false",
    "aria-hidden": "true",
  };

  if (name === "tasks") {
    return <svg {...common}>
      <rect x="8" y="4" width="12" height="16" rx="2" />
      <path d="M4 8h1M4 12h1M4 16h1M11 9h6M11 13h6M11 17h4" />
      <path d="M10 4.5V3.8A1.8 1.8 0 0 1 11.8 2h4.4A1.8 1.8 0 0 1 18 3.8v.7" />
    </svg>;
  }

  if (name === "completed") {
    return <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.2 2.6 2.6L16.5 9" />
    </svg>;
  }

  if (name === "progress") {
    return <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.4 2" />
    </svg>;
  }

  return <svg {...common}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.2" />
    <path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" />
    <path d="M12 12.5v3.2M12 18h.01" />
  </svg>;
}

function Stats() {
  const { language } = useLanguage();
  const isPersian = language === "fa";
  const t = (en, fa) => translate(language, en, fa);
  const numberLocale = language === "fa" ? "fa-IR" : "en-US";
  const formatNumber = (value) => new Intl.NumberFormat(numberLocale).format(value);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data, error: queryError } = await supabase
          .from("tasks")
          .select("id,status,priority,category,due_date");
        if (!active) return;
        if (queryError) {
          console.error("Statistics query failed:", queryError);
          setError(t("Statistics could not be loaded. Please try again.", "بارگذاری آمار انجام نشد. دوباره تلاش کنید."));
        } else {
          setTasks(data || []);
        }
      } catch (queryError) {
        console.error("Statistics request failed:", queryError);
        if (active) setError(t("Could not connect to the server.", "ارتباط با سرور برقرار نشد."));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [language]);

  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const pending = tasks.filter((task) => task.status !== "completed").length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const overdue = tasks.filter((task) =>
    task.due_date && task.status !== "completed" &&
    new Date(`${task.due_date}T23:59:59`) < new Date()
  ).length;

  const metrics = [
    { label: t("Total tasks", "مجموع وظایف"), value: total, icon: "tasks", tone: "total" },
    { label: t("Completed", "تکمیل‌شده"), value: completed, icon: "completed", tone: "completed" },
    { label: t("In progress", "در حال انجام"), value: pending, icon: "progress", tone: "pending" },
    { label: t("Overdue", "عقب‌افتاده"), value: overdue, icon: "overdue", tone: "overdue" },
  ];

  return (
    <div dir={isPersian ? "rtl" : "ltr"}>
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.head}>
            <div>
              <span className={styles.eyebrow}>{t("YOUR PERFORMANCE", "عملکرد شما")}</span>
              <h1>{t("Statistics", "آمار و عملکرد")}</h1>
              <p>{t("A clear picture of your productivity.", "نمایی روشن از روند و میزان بهره‌وری شما.")}</p>
            </div>
            <Link to="/home" className={styles.backLink}>
              <i className={`fa ${isPersian ? "fa-arrow-right" : "fa-arrow-left"}`} aria-hidden="true" />
              {t("Back to dashboard", "بازگشت به داشبورد")}
            </Link>
          </header>

          {error && <p className={styles.error} role="alert">{error}</p>}
          {loading ? (
            <div className={styles.loading} aria-live="polite">{t("Loading your statistics...", "در حال بارگذاری آمار...")}</div>
          ) : (
            <>
              <section className={styles.summary}>
                <div className={styles.completion}>
                  <span className={styles.eyebrow}>{t("TASK COMPLETION", "میزان تکمیل وظایف")}</span>
                  <div className={styles.progressVisited}>
                    <div className={styles.progressCircle} style={{ "--progress": `${progress}%` }} role="img" aria-label={t(`${progress}% of tasks completed`, `${formatNumber(progress)} درصد از وظایف تکمیل شده است`)}>
                      <div className={styles.progressInner}><strong>{formatNumber(progress)}%</strong></div>
                    </div>
                    <div className={styles.progressCopy}>
                      <h2>{formatNumber(completed)} {t("of", "از")} {formatNumber(total)}</h2>
                      <p>{t("tasks completed", "وظیفه تکمیل‌شده")}</p>
                      <span>{formatNumber(pending)} {t("tasks remaining", "وظیفه باقی‌مانده")}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.metrics}>
                  {metrics.map((metric) => (
                    <article className={`${styles.metricCard} ${styles[metric.tone]}`} key={metric.tone}>
                      <div className={styles.metricTop}>
                        <span>{metric.label}</span>
                        <span className={styles.metricIcon} aria-hidden="true"><MetricIcon name={metric.icon} /></span>
                      </div>
                      <strong>{formatNumber(metric.value)}</strong>
                      <span className={styles.metricCaption}>{t("Your workspace", "فضای کاری شما")}</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className={styles.details}>
                <div className={styles.priorityCard}>
                  <h2>{t("Priority breakdown", "تفکیک بر اساس اولویت")}</h2>
                  {["high", "medium", "low"].map((level) => {
                    const count = tasks.filter((task) => task.priority === level).length;
                    const label = level === "high" ? t("High", "زیاد") : level === "medium" ? t("Medium", "متوسط") : t("Low", "کم");
                    return (
                      <div className={styles.barRow} key={level}>
                        <span>{label}</span>
                        <div className={styles.barTrack}><i style={{ width: `${total ? (count / total) * 100 : 0}%` }} /></div>
                        <b>{formatNumber(count)}</b>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.insight}>
                  <span className={styles.insightIcon}><i className="fa fa-lightbulb-o" aria-hidden="true" /></span>
                  <h2>{t("Keep your momentum", "به مسیر پیشرفت ادامه دهید")}</h2>
                  <p>{total
                    ? t(`You've completed ${progress}% of your tasks. Keep making steady progress.`, `شما ${formatNumber(progress)} درصد از وظایف را تکمیل کرده‌اید. همین روند را ادامه دهید.`)
                    : t("Add your first task to start tracking your productivity.", "اولین وظیفه خود را اضافه کنید تا روند بهره‌وری شما ثبت شود.")}</p>
                  <Link to="/tasks">{t("Open task manager", "رفتن به مدیریت وظایف")} <i className={`fa ${isPersian ? "fa-arrow-left" : "fa-arrow-right"}`} /></Link>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export default Stats;
