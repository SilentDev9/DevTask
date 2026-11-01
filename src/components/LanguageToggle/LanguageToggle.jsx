import { useLanguage } from "../../context/LanguageContext";
import styles from "./LanguageToggle.module.css";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  return <button className={styles.toggle} type="button" onClick={toggleLanguage} aria-label="Change language" title="Change language">
    <i className="fa fa-globe" aria-hidden="true" />
    <span>{language === "en" ? "فارسی" : "English"}</span>
  </button>;
}
