import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav/BottomNav";
import Notification from "../../components/Notification/Notification";
import Loader from "../../components/Loader/Loader";
import styles from "./Tasks.module.css";
import { useLanguage, translate } from "../../context/LanguageContext";

const emptyTask = {
  title: "",
  description: "",
  priority: "medium",
  category: "Personal",
  due_date: "",
  status: "pending",
};

function Tasks() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en, fa) => translate(language, en, fa);
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const filters = location.state || {
    priority: "all",
    status: "all",
    project: "all",
  };

  const notify = (message, type = "info") =>
    setNotice({ message, type, id: Date.now() });

  async function fetchTasks() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) notify(error.message || "Could not load tasks.", "danger");
    else setTasks(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const term = search.trim().toLowerCase();
        return (
          (!term ||
            `${task.title || ""} ${task.description || ""}`
              .toLowerCase()
              .includes(term)) &&
          (activeFilter === "all" || task.status === activeFilter) &&
          (filters.status === "all" || task.status === filters.status) &&
          (filters.priority === "all" ||
            (task.priority || "").toLowerCase() === filters.priority) &&
          (filters.project === "all" ||
            (task.category || "").toLowerCase() === filters.project)
        );
      }),
    [tasks, search, activeFilter, filters],
  );

  async function updateStatus(task, checked) {
    const status = checked ? "completed" : "pending";
    const { error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", task.id);
    if (error)
      return notify(error.message || "Status update failed.", "danger");
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, status } : item)),
    );
    notify("Task status updated.", "success");
  }

  async function saveEdit(event) {
    event.preventDefault();
    if (!editing?.title?.trim())
      return notify("Task title is required.", "warning");
    setSaving(true);
    const payload = {
      title: editing.title.trim(),
      description: editing.description?.trim() || null,
      priority: editing.priority,
      category: editing.category,
      due_date: editing.due_date || null,
    };
    const { data, error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("id", editing.id)
      .select()
      .single();
    setSaving(false);
    if (error) return notify(error.message || "Task update failed.", "danger");
    setTasks((current) =>
      current.map((item) => (item.id === editing.id ? data : item)),
    );
    setEditing(null);
    notify("Task updated successfully.", "success");
  }

  async function confirmDelete() {
    if (!deleting || saving) return;
    setSaving(true);
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", deleting.id);
    setSaving(false);
    if (error)
      return notify(error.message || "Task deletion failed.", "danger");
    setTasks((current) => current.filter((item) => item.id !== deleting.id));
    setDeleting(null);
    notify("Task deleted.", "success");
  }

  return (
    <>
      <main className={styles.page}>
        {notice && (
          <Notification
            key={notice.id}
            message={notice.message}
            type={notice.type}
            onClose={() => setNotice(null)}
            duration={4000}
          />
        )}
        <div className={styles.container}>
          <header className={styles.pageHeader}>
            <div>
              <span className={styles.eyebrow}>
                {t("WORKSPACE", "فضای کاری")}
              </span>
              <h1>
                <i className="fa fa-tasks" /> {t("My Tasks", "تسک‌های من")}
              </h1>
              <p>
                {t(
                  "Plan, prioritize, and keep your work moving.",
                  "برنامه‌ریزی کنید، اولویت بدهید و کارها را پیش ببرید.",
                )}
              </p>
            </div>
            <button
              className={styles.addButton}
              onClick={() => navigate("/addTasks")}
            >
              <i className="fa fa-plus" /> Add task
            </button>
          </header>
          <div className={styles.toolbar}>
            <label className={styles.searchBox}>
              <i className="fa fa-search" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("Search tasks...", "جست‌وجوی تسک‌ها...")}
              />
            </label>
            <button
              className={styles.filterAction}
              onClick={() => navigate("/tasks/filterTasks")}
            >
              <i className="fa fa-sliders" /> Filters
            </button>
          </div>
          <nav className={styles.taskFilters}>
            {["all", "pending", "completed"].map((filter) => (
              <button
                key={filter}
                className={activeFilter === filter ? styles.filterActive : ""}
                onClick={() => setActiveFilter(filter)}
              >
                {filter[0].toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </nav>
          <section className={styles.listTasks}>
            {loading ? (
              <Loader />
            ) : filteredTasks.length ? (
              filteredTasks.map((task) => (
                <article
                  key={task.id}
                  className={`${styles.taskCard} ${task.status === "completed" ? styles.taskCompleted : ""}`}
                >
                  <div className={styles.taskMain}>
                    <input
                      aria-label={`Mark ${task.title} completed`}
                      type="checkbox"
                      checked={task.status === "completed"}
                      onChange={(e) => updateStatus(task, e.target.checked)}
                    />
                    <div className={styles.taskText}>
                      <h2>{task.title}</h2>
                      {task.description && <p>{task.description}</p>}
                      <div className={styles.meta}>
                        <span
                          className={`${styles.pill} ${styles[(task.priority || "medium").toLowerCase()]}`}
                        >
                          {task.priority || "Medium"} priority
                        </span>
                        <span className={styles.pill}>
                          {task.category || "General"}
                        </span>
                        <span>
                          <i className="fa fa-calendar" />{" "}
                          {task.due_date || "No due date"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button
                      aria-label="Edit task"
                      onClick={() => setEditing({ ...emptyTask, ...task })}
                    >
                      <i className="fa fa-pencil" />
                    </button>
                    <button
                      aria-label="Delete task"
                      onClick={() => setDeleting(task)}
                    >
                      <i className="fa fa-trash" />
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className={styles.empty}>
                <i className="fa fa-clipboard-list" />
                <h2>{t("No tasks found", "تسکی پیدا نشد")}</h2>
                <p>
                  {t(
                    "Try another search or create a new task.",
                    "عبارت دیگری جست‌وجو کنید یا تسک جدید بسازید.",
                  )}
                </p>
                <button onClick={() => navigate("/addTasks")}>
                  {t("Create a task", "ساخت تسک جدید")}
                </button>
              </div>
            )}
          </section>
        </div>
        {editing && (
          <div className={styles.overlay} role="presentation">
            <form className={styles.dialog} onSubmit={saveEdit}>
              <button
                type="button"
                className={styles.close}
                onClick={() => setEditing(null)}
                aria-label="Close"
              >
                ×
              </button>
              <span className={styles.eyebrow}>
                {t("TASK DETAILS", "جزئیات تسک")}
              </span>
              <h2>{t("Edit task", "ویرایش تسک")}</h2>
              <label>
                {t("Title", "عنوان")}
                <input
                  required
                  maxLength="200"
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                />
              </label>
              <label>
                {t("Description", "توضیحات")}
                <textarea
                  rows="3"
                  value={editing.description || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </label>
              <div className={styles.formRow}>
                <label>
                  {t("Priority", "اولویت")}
                  <select
                    value={editing.priority || "medium"}
                    onChange={(e) =>
                      setEditing({ ...editing, priority: e.target.value })
                    }
                  >
                    <option value="low">{t("Low", "کم")}</option>
                    <option value="medium">{t("Medium", "متوسط")}</option>
                    <option value="high">{t("High", "زیاد")}</option>
                  </select>
                </label>
                <label>
                  {t("Project", "پروژه")}
                  <input
                    value={editing.category || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, category: e.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                {t("Due date", "تاریخ سررسید")}
                <input
                  type="date"
                  value={editing.due_date || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, due_date: e.target.value })
                  }
                />
              </label>
              <button className={styles.addButton} disabled={saving}>
                {saving
                  ? t("Saving...", "در حال ذخیره...")
                  : t("Save changes", "ذخیره تغییرات")}
              </button>
            </form>
          </div>
        )}
        {deleting && (
          <div className={styles.overlay} role="presentation">
            <div className={styles.dialog}>
              <span className={styles.eyebrow}>
                {t("CONFIRM ACTION", "تأیید عملیات")}
              </span>
              <h2>{t("Delete this task?", "این تسک حذف شود؟")}</h2>
              <p>
                {t(
                  "This will permanently remove",
                  "این تسک برای همیشه حذف می‌شود",
                )}
                : “{deleting.title}”.
              </p>
              <div className={styles.dialogActions}>
                <button type="button" onClick={() => setDeleting(null)}>
                  {t("Cancel", "انصراف")}
                </button>
                <button
                  type="button"
                  className={styles.deleteConfirm}
                  onClick={confirmDelete}
                  disabled={saving}
                >
                  {saving
                    ? t("Deleting...", "در حال حذف...")
                    : t("Delete task", "حذف تسک")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
export default Tasks;
