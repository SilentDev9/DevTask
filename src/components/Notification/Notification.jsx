import { useEffect } from "react";
import styles from "./Notification.module.css";
import { useLanguage } from "../../context/LanguageContext";

function Notification({ message, type = "info", onClose, duration = 4000 }) {
  const { language } = useLanguage();
  useEffect(() => {
    if (!duration || !onClose) return;

    const timerId = window.setTimeout(() => {
      onClose();
    }, duration);

    return () => window.clearTimeout(timerId);
  }, [duration, onClose]);

  const allowedTypes = ["success", "warning", "danger", "info"];
  const safeType = allowedTypes.includes(type) ? type : "info";

  const icons = {
    success: "✓",
    warning: "!",
    danger: "×",
    info: "i",
  };

  return (
    <div
      className={`${styles.NotificationDiv} ${styles[safeType]}`}
      dir={language === "fa" ? "rtl" : "ltr"}
      role={
        safeType === "danger" || safeType === "warning" ? "alert" : "status"
      }
      aria-live={
        safeType === "danger" || safeType === "warning" ? "assertive" : "polite"
      }
    >
      <span className={styles.icon} aria-hidden="true">
        {icons[safeType]}
      </span>

      <p className={styles.message}>{message}</p>

      <button
        className={styles.closeButton}
        type="button"
        onClick={onClose}
        aria-label={language === "fa" ? "بستن اعلان" : "Close notification"}
      >
        ×
      </button>
    </div>
  );
}

export default Notification;
