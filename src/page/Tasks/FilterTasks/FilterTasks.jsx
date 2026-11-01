import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage, translate } from "../../../context/LanguageContext";
import BottomNav from "../../../components/BottomNav/BottomNav";
import styles from "./FilterTasks.module.css";

const options = {
  status: [
    { value: "all", en: "All tasks", fa: "همه تسک‌ها", icon: "fa-layer-group" },
    { value: "pending", en: "Pending", fa: "در انتظار", icon: "fa-clock-o" },
    { value: "completed", en: "Completed", fa: "تکمیل‌شده", icon: "fa-check-circle" },
  ],
  priority: [
    { value: "all", en: "All priorities", fa: "همه اولویت‌ها", icon: "fa-list" },
    { value: "high", en: "High", fa: "زیاد", icon: "fa-angle-double-up" },
    { value: "medium", en: "Medium", fa: "متوسط", icon: "fa-minus" },
    { value: "low", en: "Low", fa: "کم", icon: "fa-angle-double-down" },
  ],
  project: [
    { value: "all", en: "All projects", fa: "همه پروژه‌ها", icon: "fa-th-large" },
    { value: "personal", en: "Personal", fa: "شخصی", icon: "fa-user" },
    { value: "work", en: "Work", fa: "کاری", icon: "fa-briefcase" },
    { value: "study", en: "Study", fa: "تحصیلی", icon: "fa-book" },
    { value: "other", en: "Other", fa: "سایر", icon: "fa-folder" },
  ],
};

export default function FilterTasks() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const fa = language === "fa";
  const t = (en, persian) => translate(language, en, persian);
  const [selected, setSelected] = useState({ status: "all", priority: "all", project: "all" });

  const choose = (group, value) => setSelected((current) => ({ ...current, [group]: value }));
  const apply = () => navigate("/tasks", { state: selected });
  const reset = () => setSelected({ status: "all", priority: "all", project: "all" });

  return <main className={styles.page}>
    <div className={styles.container}>
      <header className={styles.header}>
        <div><span className={styles.eyebrow}>{t("TASK MANAGER", "مدیریت تسک‌ها")}</span><h1><i className="fa fa-sliders" /> {t("Filter tasks", "فیلتر تسک‌ها")}</h1><p>{t("Narrow your list and focus on what matters.", "لیست تسک‌ها را محدود کنید و روی موارد مهم تمرکز کنید.")}</p></div>
        <button className={styles.closeButton} type="button" onClick={() => navigate("/tasks")} aria-label={t("Close filters", "بستن فیلترها")}><i className="fa fa-times" /></button>
      </header>

      {Object.entries(options).map(([group, items]) => <section className={styles.filterSection} key={group}>
        <div className={styles.sectionHeading}><h2>{t(group === "status" ? "Status" : group === "priority" ? "Priority" : "Project", group === "status" ? "وضعیت" : group === "priority" ? "اولویت" : "پروژه")}</h2><span>{t("Choose one", "یک مورد انتخاب کنید")}</span></div>
        <div className={`${styles.optionsGrid} ${group === "project" ? styles.projectGrid : ""}`}>
          {items.map((item) => <button type="button" key={item.value} aria-pressed={selected[group] === item.value} onClick={() => choose(group, item.value)} className={`${styles.option} ${styles[group]} ${selected[group] === item.value ? styles.active : ""}`}>
            <span className={styles.optionIcon}><i className={`fa ${item.icon}`} /></span><span className={styles.optionLabel}>{t(item.en, item.fa)}</span><span className={styles.check}><i className="fa fa-check" /></span>
          </button>)}
        </div>
      </section>)}

      <footer className={styles.actions}>
        <button type="button" className={styles.resetButton} onClick={reset}><i className="fa fa-refresh" /> {t("Reset", "پاک کردن")}</button>
        <button type="button" className={styles.applyButton} onClick={apply}>{t("Apply filters", "اعمال فیلترها")} <i className={`fa ${fa ? "fa-arrow-left" : "fa-arrow-right"}`} /></button>
      </footer>
    </div>
    <BottomNav />
  </main>;
}
