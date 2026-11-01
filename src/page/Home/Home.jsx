import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";

import { supabase } from "../../lib/supabase";
import OpenWebsite from "../../components/OpenWebsite/OpenWebsite";
import BottomNav from "../../components/BottomNav/BottomNav";
import { useLanguage, translate } from "../../context/LanguageContext";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";

function Home() {
  const { language } = useLanguage();
  const t = (en, fa) => translate(language, en, fa);
  const [displayName, setDisplayName] = useState("");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [tasks, setTasks] = useState([]);

  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    progress: 0,
  });

  useEffect(() => {
    loadUser();
    loadTasks();
  }, []);

  const loadUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) throw error;

      const user = data?.user;

      if (user) {
        const name =
          user.user_metadata?.userName ||
          user.user_metadata?.username ||
          user.email?.split("@")[0] ||
          "User";

        setDisplayName(name);
      }
    } catch (error) {
      console.error("Error loading user:", error.message);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const taskData = data || [];

      const total = taskData.length;
      const completed = taskData.filter(
        (task) => task.status === "completed",
      ).length;

      const pending = taskData.filter(
        (task) => task.status === "pending",
      ).length;

      const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

      setTasks(taskData);

      setTaskStats({
        total,
        completed,
        pending,
        progress,
      });
    } catch (error) {
      console.error("Error loading tasks:", error.message);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const today = new Date();

  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const recentTasks = tasks.slice(0, 5);

  const upcomingTasks = tasks
    .filter((task) => {
      if (!task.due_date || task.status === "completed") return false;

      const dueDate = new Date(`${task.due_date}T00:00:00`);

      return !Number.isNaN(dueDate.getTime()) && dueDate >= todayDate;
    })
    .sort(
      (a, b) =>
        new Date(`${a.due_date}T00:00:00`) - new Date(`${b.due_date}T00:00:00`),
    )
    .slice(0, 3);

  const getTaskDate = (date) => {
    if (!date) return "No deadline";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getInitial = () => {
    return displayName?.charAt(0)?.toUpperCase() || "U";
  };

  if (isLoadingUser) {
    return <OpenWebsite />;
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.backgroundGlow}></div>

        <header className={styles.header}>
          <Link to="/" className={styles.headerBrand}>
            <div className={styles.logoIcon}>
              <i className="fas fa-layer-group"></i>
            </div>

            <div>
              <h2 className={styles.logo}>DevTask</h2>
              <span className={styles.brandSubtitle}>
                {t("WORKSPACE", "فضای کاری")}
              </span>
            </div>
          </Link>

          <nav className={styles.headerNav}>
            <Link to="/" className={styles.navActive}>
              <i className="fas fa-th-large"></i>
              <span>{t("Dashboard", "داشبورد")}</span>
            </Link>

            <Link to="/tasks">
              <i className="fas fa-tasks"></i>
              <span>{t("My Tasks", "تسک‌های من")}</span>
            </Link>
            <Link to="/stats">
              <i className="fas fa-chart-line"></i>
              <span>{t("Statistics", "آمار")}</span>
            </Link>
            <Link to="/profile">
              <i className="fas fa-user"></i>
              <span>{t("Profile", "پروفایل")}</span>
            </Link>
            <Link to="/about">
              <i className="fas fa-info-circle"></i>
              <span>{t("About", "درباره ما")}</span>
            </Link>
            <Link to="/support">
              <i className="fas fa-life-ring"></i>
              <span>{t("Support", "پشتیبانی")}</span>
            </Link>
          </nav>

          <div className={styles.headerRight}>
            <LanguageToggle />
            <div className={styles.onlineStatus}>
              <span></span>
              All systems normal
            </div>

            <button
              className={styles.notificationButton}
              type="button"
              aria-label="Notifications"
            >
              <i className="far fa-bell"></i>
              <span></span>
            </button>

            <div className={styles.profile}>
              <div className={styles.profileAvatar}>{getInitial()}</div>

              <div className={styles.profileInfo}>
                <strong>{displayName || "User"}</strong>
                <span>{t("Personal workspace", "فضای کاری شخصی")}</span>
              </div>

              <i className="fas fa-chevron-down"></i>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <section className={styles.welcomeSection}>
            <div className={styles.welcomeContent}>
              <span className={styles.welcomeDate}>
                <i className="far fa-calendar-alt"></i>
                {formattedDate}
              </span>

              <h1>
                {t("Welcome back,", "خوش برگشتی،")}{" "}
                <span>{displayName || "User"}</span>
              </h1>

              <p>
                Ready to make today productive? Keep your tasks organized and
                make progress on what matters.
              </p>

              <div className={styles.welcomeActions}>
                <Link to="/tasks" className={styles.primaryButton}>
                  <i className="fas fa-plus"></i>
                  Manage Tasks
                </Link>

                <Link to="/tasks" className={styles.secondaryButton}>
                  View all tasks
                  <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>

            <div className={styles.welcomeDecoration}>
              <div className={`${styles.orbit} ${styles.orbitOne}`}></div>

              <div className={`${styles.orbit} ${styles.orbitTwo}`}></div>

              <div className={styles.heroIcon}>
                <i className="fas fa-rocket"></i>
              </div>

              <div className={styles.floatingBadge}>
                <i className="fas fa-bolt"></i>
                Stay productive
              </div>
            </div>
          </section>

          <section className={styles.statsSection}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionEyebrow}>OVERVIEW</span>
                <h2>Your productivity</h2>
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.totalCard}`}>
                <div className={styles.statTop}>
                  <div className={styles.statIcon}>
                    <i className="fas fa-layer-group"></i>
                  </div>
                  <span className={styles.statTag}>All tasks</span>
                </div>

                <h3 className={styles.statNumber}>
                  {isLoadingTasks ? "--" : taskStats.total}
                </h3>

                <p>Total tasks</p>
              </div>

              <div className={`${styles.statCard} ${styles.completedCard}`}>
                <div className={styles.statTop}>
                  <div className={styles.statIcon}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <span className={styles.statTag}>Finished</span>
                </div>

                <h3 className={styles.statNumber}>
                  {isLoadingTasks ? "--" : taskStats.completed}
                </h3>

                <p>Completed tasks</p>
              </div>

              <div className={`${styles.statCard} ${styles.pendingCard}`}>
                <div className={styles.statTop}>
                  <div className={styles.statIcon}>
                    <i className="fas fa-clock"></i>
                  </div>
                  <span className={styles.statTag}>In progress</span>
                </div>

                <h3 className={styles.statNumber}>
                  {isLoadingTasks ? "--" : taskStats.pending}
                </h3>

                <p>Pending tasks</p>
              </div>

              <div className={`${styles.statCard} ${styles.progressCard}`}>
                <div className={styles.statTop}>
                  <div className={styles.statIcon}>
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <span className={styles.statTag}>Performance</span>
                </div>

                <h3 className={styles.statNumber}>
                  {isLoadingTasks ? "--" : `${taskStats.progress}%`}
                </h3>

                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${taskStats.progress}%` }}
                    role="progressbar"
                    aria-valuenow={taskStats.progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label="Task completion progress"
                  ></div>
                </div>

                <p>Completion rate</p>
              </div>
            </div>
          </section>

          <section className={styles.dashboardGrid}>
            <div className={styles.contentCard}>
              <div className={styles.cardHeading}>
                <div>
                  <span className={styles.sectionEyebrow}>YOUR WORK</span>
                  <h2>Recent Tasks</h2>
                </div>

                <Link to="/tasks" className={styles.viewAll}>
                  View all
                  <i className="fas fa-arrow-right"></i>
                </Link>
              </div>

              {isLoadingTasks ? (
                <div className={styles.emptyState}>
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading tasks...</p>
                </div>
              ) : recentTasks.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <i className="fas fa-clipboard-list"></i>
                  </div>
                  <h3>No tasks yet</h3>
                  <p>Your tasks will appear here once you create them.</p>
                  <Link to="/tasks" className={styles.primaryButton}>
                    <i className="fas fa-plus"></i>
                    Create your first task
                  </Link>
                </div>
              ) : (
                <div className={styles.taskList}>
                  {recentTasks.map((task) => (
                    <div className={styles.taskItem} key={task.id}>
                      <div
                        className={`${styles.taskStatusIcon} ${
                          task.status === "completed"
                            ? styles.taskDone
                            : styles.taskWaiting
                        }`}
                      >
                        <i
                          className={
                            task.status === "completed"
                              ? "fas fa-check"
                              : "fas fa-hourglass-half"
                          }
                        ></i>
                      </div>

                      <div className={styles.taskInfo}>
                        <h3
                          className={
                            task.status === "completed"
                              ? styles.completedTitle
                              : ""
                          }
                        >
                          {task.title}
                        </h3>

                        <span>
                          {task.due_date
                            ? `Due ${getTaskDate(task.due_date)}`
                            : "No deadline"}
                        </span>
                      </div>

                      <span
                        className={`${styles.taskBadge} ${
                          task.status === "completed"
                            ? styles.badgeCompleted
                            : styles.badgePending
                        }`}
                      >
                        {task.status === "completed" ? "Completed" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.contentCard}>
              <div className={styles.cardHeading}>
                <div>
                  <span className={styles.sectionEyebrow}>STAY ON TRACK</span>
                  <h2>Upcoming Tasks</h2>
                </div>

                <div className={styles.upcomingIcon}>
                  <i className="far fa-calendar-check"></i>
                </div>
              </div>

              {isLoadingTasks ? (
                <div className={styles.emptyState}>
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading tasks...</p>
                </div>
              ) : upcomingTasks.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <i className="far fa-calendar"></i>
                  </div>
                  <h3>Nothing scheduled</h3>
                  <p>You have no upcoming deadlines.</p>
                </div>
              ) : (
                <div className={styles.upcomingList}>
                  {upcomingTasks.map((task) => (
                    <div className={styles.upcomingItem} key={task.id}>
                      <div className={styles.dateBox}>
                        <strong>
                          {new Date(`${task.due_date}T00:00:00`).getDate()}
                        </strong>

                        <span>
                          {new Date(
                            `${task.due_date}T00:00:00`,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </span>
                      </div>

                      <div className={styles.upcomingInfo}>
                        <h3>{task.title}</h3>
                        <span>Task deadline</span>
                      </div>

                      <i className="fas fa-chevron-right"></i>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.upcomingFooter}>
                <Link to="/tasks">
                  Open task manager
                  <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </section>

          <section className={styles.motivationBanner}>
            <div className={styles.motivationIcon}>
              <i className="fas fa-lightbulb"></i>
            </div>

            <div>
              <h3>Small steps lead to big results.</h3>
              <p>
                Stay consistent, focus on your priorities, and keep moving
                forward.
              </p>
            </div>

            <div className={styles.motivationDecoration}>
              <i className="fas fa-star"></i>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <span>DevTask</span>
            <p>Make every day count.</p>
          </div>

          <span className={styles.copyright}>
            © {new Date().getFullYear()} DevTask. All rights reserved.
          </span>
        </footer>
      </div>
      <div className={styles.mobileBottomNav}>
        <BottomNav />
      </div>
    </>
  );
}

export default Home;
