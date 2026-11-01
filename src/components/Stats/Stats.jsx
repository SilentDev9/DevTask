import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import BottomNav from "../BottomNav/BottomNav";
import styles from "./Stats.module.css";
import { useLanguage, translate } from "../../context/LanguageContext";

function Stats() {
  const { language } = useLanguage();
  const t = (en, fa) => translate(language, en, fa);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data, error: queryError } = await supabase
        .from("tasks")
        .select("id,status,priority,category,due_date");
      if (!active) return;
      if (queryError) setError(queryError.message);
      else setTasks(data || []);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const pending = tasks.filter((task) => task.status !== "completed").length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const highPriority = tasks.filter(
    (task) => task.priority === "high" && task.status !== "completed",
  ).length;
  const overdue = tasks.filter(
    (task) =>
      task.due_date &&
      task.status !== "completed" &&
      new Date(`${task.due_date}T23:59:59`) < new Date(),
  ).length;

  return (
    <div>
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.head}>
            <div>
              <span className={styles.eyebrow}>
                {t("YOUR PERFORMANCE", "عملکرد شما")}
              </span>
              <h1>{t("Statistics", "آمار")}</h1>
              <p>
                {t(
                  "A clear picture of your productivity.",
                  "نمایی روشن از بهره‌وری شما.",
                )}
              </p>
            </div>
            <Link to="/home">
              Back to dashboard <i className="fa fa-arrow-right" />
            </Link>
          </header>
          {error && <p className={styles.error}>{error}</p>}
          {loading ? (
            <div className={styles.loading}>
              {t("Loading your statistics...", "در حال بارگذاری آمار...")}
            </div>
          ) : (
            <>
              <section className={styles.summary}>
                <div className={styles.completion}>
                  <span className={styles.eyebrow}>
                    {t("TASK COMPLETION", "تکمیل تسک‌ها")}
                  </span>
                  <div className={styles.progressVisited}>
                    <div
                      className={styles.progressCircle}
                      style={{ "--progress": `${progress}%` }}
                    >
                      <div className={styles.progressInner}>
                        <strong>{progress}%</strong>
                      </div>
                    </div>
                    <div>
                      <h2>
                        {completed} of {total}
                      </h2>
                      <p>{t("tasks completed", "تسک تکمیل‌شده")}</p>
                      <span>{pending} tasks remaining</span>
                    </div>
                  </div>
                </div>
                <div className={styles.metrics}>
                  <article>
                    <span>{t("Total tasks", "مجموع تسک‌ها")}</span>
                    <strong>{total}</strong>
                    <i className="fa fa-layer-group" />
                  </article>
                  <article>
                    <span>{t("Completed", "تکمیل‌شده")}</span>
                    <strong>{completed}</strong>
                    <i className="fa fa-check-circle" />
                  </article>
                  <article>
                    <span>{t("Pending", "در انتظار")}</span>
                    <strong>{pending}</strong>
                    <i className="fa fa-clock-o" />
                  </article>
                  <article>
                    <span>{t("Overdue", "عقب‌افتاده")}</span>
                    <strong>{overdue}</strong>
                    <i className="fa fa-calendar-times-o" />
                  </article>
                </div>
              </section>
              <section className={styles.details}>
                <div>
                  <h2>{t("Priority breakdown", "جزئیات اولویت‌ها")}</h2>
                  {["high", "medium", "low"].map((level) => {
                    const count = tasks.filter(
                      (task) => task.priority === level,
                    ).length;
                    return (
                      <div className={styles.barRow} key={level}>
                        <span>{level}</span>
                        <div>
                          <i
                            style={{
                              width: `${total ? (count / total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <b>{count}</b>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.insight}>
                  <i className="fa fa-lightbulb-o" />
                  <h2>{t("Keep your momentum", "به مسیر ادامه دهید")}</h2>
                  <p>
                    {total
                      ? `You've completed ${progress}% of your tasks. Keep making steady progress.`
                      : "Add your first task to start tracking your productivity."}
                  </p>
                  <Link to="/tasks">
                    {t("Open task manager", "مدیریت تسک‌ها")}
                  </Link>
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
