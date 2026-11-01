import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AddTasks.module.css";
import Notification from "../../../components/Notification/Notification";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../context/LanguageContext";

function AddTasks() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const fa = language === "fa";
  const [addTitle, setTitle] = useState("");
  const [addDirection, setAddDirection] = useState("");
  const [addDate, setAddDate] = useState(new Date().toISOString().slice(0, 10));
  const [addPriority, setAddPriority] = useState("medium");
  const [addProject, setAddProject] = useState("Personal");
  const [notification, setNotification] = useState(null);
  const [showAccept, setShowAccept] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const t = (en, persian) => (fa ? persian : en);
  function showNotification(message, type) {
    setNotification({ message, type, id: Date.now() });
  }
  function addTaskHandler(event) {
    event.preventDefault();
    if (isSaving) return;
    const title = addTitle.trim();
    if (!title)
      return showNotification(
        t("Please enter a task title.", "لطفاً عنوان تسک را وارد کنید."),
        "warning",
      );
    if (title.length < 3)
      return showNotification(
        t(
          "Title must contain at least 3 characters.",
          "عنوان باید حداقل ۳ نویسه داشته باشد.",
        ),
        "warning",
      );
    if (title.length > 200)
      return showNotification(
        t(
          "Title cannot exceed 200 characters.",
          "عنوان نمی‌تواند بیشتر از ۲۰۰ نویسه باشد.",
        ),
        "warning",
      );
    if (addDate && Number.isNaN(Date.parse(`${addDate}T00:00:00`)))
      return showNotification(
        t("Please choose a valid due date.", "تاریخ سررسید معتبر نیست."),
        "warning",
      );
    setShowAccept(true);
  }
  async function confirmAddTask() {
    if (isSaving) return;
    if (!addTitle.trim() || addTitle.trim().length < 3) {
      setShowAccept(false);
      showNotification(
        t("Please check the task title.", "لطفاً عنوان تسک را بررسی کنید."),
        "warning",
      );
      return;
    }
    setIsSaving(true);
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user)
        throw userError || new Error("Please sign in again.");
      const { error } = await supabase.from("tasks").insert({
        user_id: userData.user.id,
        title: addTitle.trim(),
        description: addDirection.trim() || null,
        priority: addPriority,
        category: addProject,
        due_date: addDate || null,
      });
      if (error) throw error;
      setShowAccept(false);
      showNotification(
        t("Task saved successfully.", "تسک با موفقیت ذخیره شد."),
        "success",
      );
      setTimeout(() => navigate("/tasks"), 900);
    } catch (error) {
      console.error("Error saving task:", error);
      setShowAccept(false);
      showNotification(
        t(
          "Could not save the task. Please try again.",
          "ذخیره تسک انجام نشد. دوباره تلاش کنید.",
        ),
        "danger",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className={styles.page} dir={fa ? "rtl" : "ltr"}>
      {notification && (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={4000}
        />
      )}
      <div
        className={`${styles.container} ${showAccept ? styles.containerHide : ""}`}
      >
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/tasks")}
            aria-label={t("Back to tasks", "بازگشت به تسک‌ها")}
            disabled={isSaving}
          >
            <i className="fa fa-arrow-left" />
          </button>
          <h1>{t("Add New Task", "افزودن تسک جدید")}</h1>
        </header>
        <form className={styles.form} onSubmit={addTaskHandler} noValidate>
          <div className={styles.field}>
            <label htmlFor="title">
              {t("Task Title", "عنوان تسک")}{" "}
              <span className={styles.required}>*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder={t(
                "What do you want to do?",
                "چه کاری می‌خواهید انجام دهید؟",
              )}
              value={addTitle}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              disabled={isSaving}
              aria-required="true"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="description">{t("Description", "توضیحات")}</label>
            <textarea
              id="description"
              name="description"
              placeholder={t(
                "Add a short description...",
                "توضیح کوتاهی بنویسید...",
              )}
              rows={5}
              value={addDirection}
              onChange={(e) => setAddDirection(e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="dueDate">{t("Due Date", "تاریخ سررسید")}</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={addDate}
              onChange={(e) => setAddDate(e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className={styles.options}>
            <div className={styles.field}>
              <label htmlFor="priority">{t("Priority", "اولویت")}</label>
              <div className={styles.selectWrapper}>
                <span
                  className={`${styles.priorityDot} ${styles[`priorityDot${addPriority[0].toUpperCase()}${addPriority.slice(1)}`]}`}
                />
                <select
                  id="priority"
                  value={addPriority}
                  onChange={(e) => setAddPriority(e.target.value)}
                  disabled={isSaving}
                >
                  <option value="low">{t("Low", "کم")}</option>
                  <option value="medium">{t("Medium", "متوسط")}</option>
                  <option value="high">{t("High", "زیاد")}</option>
                </select>
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="category">{t("Project", "پروژه")}</label>
              <div className={styles.selectWrapper}>
                <span className={styles.projectDot} />
                <select
                  id="category"
                  value={addProject}
                  onChange={(e) => setAddProject(e.target.value)}
                  disabled={isSaving}
                >
                  <option value="Personal">{t("Personal", "شخصی")}</option>
                  <option value="Work">{t("Work", "کاری")}</option>
                  <option value="Study">{t("Study", "تحصیلی")}</option>
                  <option value="Other">{t("Other", "سایر")}</option>
                </select>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSaving}
          >
            <i className="fa fa-plus" />
            <span>
              {isSaving
                ? t("Saving...", "در حال ذخیره...")
                : t("Add Task", "افزودن تسک")}
            </span>
          </button>
        </form>
      </div>
      {showAccept && (
        <div
          className={styles.dialogBackdrop}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSaving) setShowAccept(false);
          }}
        >
          <section
            className={styles.accpetOrNotAccpet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmTaskTitle"
            dir={fa ? "rtl" : "ltr"}
          >
            <div className={styles.dialogIcon}>
              <i className="fa fa-clipboard-check" aria-hidden="true" />
            </div>
            <h2 id="confirmTaskTitle">
              {t("Confirm new task", "تأیید افزودن تسک")}
            </h2>
            <p>
              {t(
                "Are you sure you want to add this task?",
                "از اضافه کردن این تسک اطمینان دارید؟",
              )}
            </p>
            <div className={styles.buttonAccpet}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setShowAccept(false)}
                disabled={isSaving}
              >
                {t("Cancel", "نه، اشتباهی زدم")}
              </button>
              <button
                type="button"
                className={styles.confirmButton}
                onClick={confirmAddTask}
                disabled={isSaving}
              >
                {isSaving
                  ? t("Saving...", "در حال ذخیره...")
                  : t("Confirm & Add", "تأیید و افزودن")}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
export default AddTasks;
