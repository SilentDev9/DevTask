import { useEffect } from "react";
import styles from "./Notification.module.css";

function Notification({ message, type = "info", onClose, duration = 4000 }) {
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
        aria-label="بستن اعلان"
      >
        ×
      </button>
    </div>
  );
}

export default Notification;
