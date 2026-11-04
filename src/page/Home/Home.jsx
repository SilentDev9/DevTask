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
  const numberLocale = language === "fa" ? "fa-IR" : "en-US";
  const formatNumber = (value) =>
    new Intl.NumberFormat(numberLocale).format(value);
  const [displayName, setDisplayName] = useState("");
  const [notificationScope, setNotificationScope] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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

  const initializeNotifications = (ownerId) => {
    const scope = ownerId || "guest";
    const storageKey = `devtask-notifications-${scope}`;
    setNotificationScope(scope);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        setNotifications(Array.isArray(parsed) ? parsed : []);
        return;
      }
    } catch (storageError) {
      console.warn("Could not read saved notifications:", storageError);
    }
    const welcomeNotice = {
      id: `welcome-${scope}`,
      type: "welcome",
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications([welcomeNotice]);
    try {
      localStorage.setItem(storageKey, JSON.stringify([welcomeNotice]));
    } catch (storageError) {
      console.warn("Could not save the welcome notification:", storageError);
    }
  };

  const updateNotifications = (updater) => {
    setNotifications((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      if (notificationScope) {
        try {
          localStorage.setItem(
            `devtask-notifications-${notificationScope}`,
            JSON.stringify(next),
          );
        } catch (storageError) {
          console.warn("Could not persist notifications:", storageError);
        }
      }
      return next;
    });
  };

  const unreadNotifications = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [notificationsOpen]);

  const loadUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) throw error;

      const user = data?.user;
      initializeNotifications(user?.id || "guest");

      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.userName ||
          user.user_metadata?.username ||
          user.email?.split("@")[0] ||
          "User";

        setDisplayName(name);
      }
    } catch (error) {
      console.error("Error loading user:", error.message);
      initializeNotifications("guest");
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

  const dateLocale = language === "fa" ? "fa-IR-u-ca-persian" : "en-US";
  const formattedDate = today.toLocaleDateString(dateLocale, {
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
    if (!date) return t("No deadline", "بدون مهلت");

    return new Date(`${date}T00:00:00`).toLocaleDateString(dateLocale, {
      month: "short",
      day: "numeric",
    });
  };

  const getInitial = () => {
    return displayName?.charAt(0)?.toUpperCase() || "U";
  };

  if (isLoadingUser) {
    return <OpenWebsite redirectAfterDelay={false} />;
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.backgroundGlow}></div>

        <header className={styles.header}>
          <Link to="/home" className={styles.headerBrand}>
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
            <Link to="/home" className={styles.navActive}>
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
              {t("All systems normal", "همه سامانه‌ها فعال هستند")}
            </div>

            <div className={styles.notificationWrap}>
              <button
                className={styles.notificationButton}
                type="button"
                aria-label={t("Notifications", "اعلان‌ها")}
                aria-expanded={notificationsOpen}
                aria-controls="devtask-notification-panel"
                onClick={() => setNotificationsOpen((open) => !open)}
              >
                <i className="far fa-bell" aria-hidden="true"></i>
                {unreadNotifications > 0 && (
                  <span className={styles.notificationBadge}>
                    {unreadNotifications > 9
                      ? "9+"
                      : formatNumber(unreadNotifications)}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <section
                  className={styles.notificationPanel}
                  id="devtask-notification-panel"
                  aria-label={t("Notifications", "اعلان‌ها")}
                >
                  <div className={styles.notificationPanelHead}>
                    <div>
                      <strong>{t("Notifications", "اعلان‌ها")}</strong>
                      <span>
                        {unreadNotifications
                          ? t(
                              `${unreadNotifications} unread`,
                              `${unreadNotifications} اعلان خوانده‌نشده`,
                            )
                          : t(
                              "You're all caught up",
                              "همه اعلان‌ها خوانده شده‌اند",
                            )}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      aria-label={t("Close notifications", "بستن اعلان‌ها")}
                    >
                      <i className="fa fa-times" aria-hidden="true" />
                    </button>
                  </div>

                  {notifications.length ? (
                    <div className={styles.notificationList}>
                      {notifications.map((item) => (
                        <article
                          className={`${styles.notificationItem} ${item.read ? styles.notificationRead : ""}`}
                          key={item.id}
                        >
                          <span
                            className={styles.notificationItemIcon}
                            aria-hidden="true"
                          >
                            <i className="fa fa-star" />
                          </span>
                          <div className={styles.notificationItemBody}>
                            <strong>
                              {t(
                                "Welcome to DevTask!",
                                "به DevTask خوش آمدید!",
                              )}
                            </strong>
                            <p>
                              {t(
                                "Your personal workspace is ready. Create your first task, organize your priorities, and follow your progress in one place.",
                                "فضای کاری شخصی شما آماده است. اولین وظیفه‌تان را بسازید، اولویت‌ها را مرتب کنید و پیشرفت خود را در یک جا دنبال کنید.",
                              )}
                            </p>
                            <span>
                              {t("Your first message", "اولین پیام شما")}
                            </span>
                          </div>
                          <button
                            type="button"
                            className={styles.dismissNotification}
                            onClick={() =>
                              updateNotifications((current) =>
                                current.filter(
                                  (notice) => notice.id !== item.id,
                                ),
                              )
                            }
                            aria-label={t("Dismiss notification", "حذف اعلان")}
                          >
                            <i className="fa fa-times" aria-hidden="true" />
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.notificationsEmpty}>
                      <i className="fa fa-bell-slash-o" aria-hidden="true" />
                      <p>{t("No notifications yet.", "هنوز اعلانی ندارید.")}</p>
                    </div>
                  )}

                  {unreadNotifications > 0 && (
                    <button
                      type="button"
                      className={styles.markReadButton}
                      onClick={() =>
                        updateNotifications((current) =>
                          current.map((item) => ({ ...item, read: true })),
                        )
                      }
                    >
                      {t("Mark all as read", "خواندن همه اعلان‌ها")}
                    </button>
                  )}
                </section>
              )}
            </div>

            <div className={styles.profile}>
              <div className={styles.profileAvatar} aria-hidden="true">
                {getInitial()}
              </div>

              <div className={styles.profileInfo}>
                <strong>{displayName || t("User", "کاربر")}</strong>
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
                <span>{displayName || t("User", "کاربر")}</span>
              </h1>

              <p>
                {t(
                  "Ready to make today productive? Keep your tasks organized and make progress on what matters.",
                  "آماده‌اید امروز را پربارتر کنید؟ کارهایتان را منظم کنید و برای هدف‌های مهم پیش بروید.",
                )}
              </p>

              <div className={styles.welcomeActions}>
                <Link to="/tasks" className={styles.primaryButton}>
                  <i className="fas fa-plus"></i>
                  {t("Manage Tasks", "مدیریت وظایف")}
                </Link>

                <Link to="/tasks" className={styles.secondaryButton}>
                  {t("View all tasks", "مشاهده همه وظایف")}
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
                {t("Stay productive", "پربازده بمانید")}
              </div>
            </div>
          </section>

          <section className={styles.statsSection}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionEyebrow}>
                  {t("OVERVIEW", "نمای کلی")}
                </span>
                <h2>{t("Your productivity", "بهره‌وری شما")}</h2>
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.totalCard}`}>
                <div className={styles.statTop}>
                  <div className={styles.statIcon}>
                    <i className="fas fa-layer-group"></i>
                  </div>
                  <span className={styles.statTag}>
                    {t("All tasks", "همه وظایف")}
                  </span>
                </div>

                <h3 className={styles.statNumber}>
                  {isLoadingTasks ? "--" : formatNumber(taskStats.total)}
                </h3>

                <p>{t("Total tasks", "مجموع وظایف")}</p>
              </div>

              <div className={`${styles.statCard} ${styles.completedCard}`}>
                <div className={styles.statTop}>
                  <div className={styles.statIcon}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <span className={styles.statTag}>
                    {t("Finished", "تکمیل‌شده")}
                  </span>
                </div>

                <h3 className={styles.statNumber}>
                  {isLoadingTasks ? "--" : formatNumber(taskStats.completed)}
                </h3>

                <p>{t("Completed tasks", "وظایف تکمیل‌شده")}</p>
              </div>

              <div className={`${styles.statCard} ${styles.pendingCard}`}>
                <div className={styles.statTop}>
                  <div className={styles.statIcon}>
                    <i className="fas fa-clock"></i>
                  </div>
                  <span className={styles.statTag}>
                    {t("In progress", "در حال انجام")}
                  </span>
                </div>

                <h3 className={styles.statNumber}>
                  {isLoadingTasks ? "--" : formatNumber(taskStats.pending)}
                </h3>

                <p>{t("Pending tasks", "وظایف در انتظار")}</p>
              </div>

              <div className={`${styles.statCard} ${styles.progressCard}`}>
                <div className={styles.statTop}>
                  <div className={styles.statIcon}>
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <span className={styles.statTag}>
                    {t("Performance", "عملکرد")}
                  </span>
                </div>

                <h3 className={styles.statNumber}>
                  {isLoadingTasks
                    ? "--"
                    : `${formatNumber(taskStats.progress)}%`}
                </h3>

                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${taskStats.progress}%` }}
                    role="progressbar"
                    aria-valuenow={taskStats.progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label={t(
                      "Task completion progress",
                      "میزان تکمیل وظایف",
                    )}
                  ></div>
                </div>

                <p>{t("Completion rate", "درصد تکمیل")}</p>
              </div>
            </div>
          </section>

          <section className={styles.dashboardGrid}>
            <div className={styles.contentCard}>
              <div className={styles.cardHeading}>
                <div>
                  <span className={styles.sectionEyebrow}>
                    {t("YOUR WORK", "کارهای شما")}
                  </span>
                  <h2>{t("Recent Tasks", "وظایف اخیر")}</h2>
                </div>

                <Link to="/tasks" className={styles.viewAll}>
                  {t("View all", "مشاهده همه")}
                  <i className="fas fa-arrow-right"></i>
                </Link>
              </div>

              {isLoadingTasks ? (
                <div className={styles.emptyState}>
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>{t("Loading tasks...", "در حال بارگذاری وظایف...")}</p>
                </div>
              ) : recentTasks.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <i className="fas fa-clipboard-list"></i>
                  </div>
                  <h3>{t("No tasks yet", "هنوز وظیفه‌ای ثبت نشده است")}</h3>
                  <p>
                    {t(
                      "Your tasks will appear here once you create them.",
                      "پس از ایجاد وظیفه، آن را در این بخش خواهید دید.",
                    )}
                  </p>
                  <Link to="/tasks" className={styles.primaryButton}>
                    <i className="fas fa-plus"></i>
                    {t("Create your first task", "اولین وظیفه‌تان را بسازید")}
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
                            ? `${t("Due", "سررسید")} ${getTaskDate(task.due_date)}`
                            : t("No deadline", "بدون مهلت")}
                        </span>
                      </div>

                      <span
                        className={`${styles.taskBadge} ${
                          task.status === "completed"
                            ? styles.badgeCompleted
                            : styles.badgePending
                        }`}
                      >
                        {task.status === "completed"
                          ? t("Completed", "تکمیل‌شده")
                          : t("Pending", "در انتظار")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.contentCard}>
              <div className={styles.cardHeading}>
                <div>
                  <span className={styles.sectionEyebrow}>
                    {t("STAY ON TRACK", "همگام با برنامه")}
                  </span>
                  <h2>{t("Upcoming Tasks", "وظایف پیش‌رو")}</h2>
                </div>

                <div className={styles.upcomingIcon}>
                  <i className="far fa-calendar-check"></i>
                </div>
              </div>

              {isLoadingTasks ? (
                <div className={styles.emptyState}>
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>{t("Loading tasks...", "در حال بارگذاری وظایف...")}</p>
                </div>
              ) : upcomingTasks.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <i className="far fa-calendar"></i>
                  </div>
                  <h3>
                    {t("Nothing scheduled", "موردی برنامه‌ریزی نشده است")}
                  </h3>
                  <p>
                    {t(
                      "You have no upcoming deadlines.",
                      "در حال حاضر مهلت پیش‌رویی ندارید.",
                    )}
                  </p>
                </div>
              ) : (
                <div className={styles.upcomingList}>
                  {upcomingTasks.map((task) => (
                    <div className={styles.upcomingItem} key={task.id}>
                      <div className={styles.dateBox}>
                        <strong>
                          {new Date(
                            `${task.due_date}T00:00:00`,
                          ).toLocaleDateString(dateLocale, { day: "numeric" })}
                        </strong>

                        <span>
                          {new Date(
                            `${task.due_date}T00:00:00`,
                          ).toLocaleDateString(dateLocale, {
                            month: "short",
                          })}
                        </span>
                      </div>

                      <div className={styles.upcomingInfo}>
                        <h3>{task.title}</h3>
                        <span>{t("Task deadline", "مهلت انجام وظیفه")}</span>
                      </div>

                      <i className="fas fa-chevron-right"></i>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.upcomingFooter}>
                <Link to="/tasks">
                  {t("Open task manager", "رفتن به مدیریت وظایف")}
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
              <h3>
                {t(
                  "Small steps lead to big results.",
                  "قدم‌های کوچک، نتایج بزرگی می‌سازند.",
                )}
              </h3>
              <p>
                {t(
                  "Stay consistent, focus on your priorities, and keep moving forward.",
                  "پیوسته بمانید، روی اولویت‌ها تمرکز کنید و به مسیرتان ادامه دهید.",
                )}
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
            <p>
              {t("Make every day count.", "از هر روز بهترین استفاده را ببرید.")}
            </p>
          </div>

          <span className={styles.copyright}>
            © {new Date().getFullYear()} DevTask.{" "}
            {t("All rights reserved.", "تمام حقوق محفوظ است.")}
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
