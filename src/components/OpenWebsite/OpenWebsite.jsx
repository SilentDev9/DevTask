import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./OpenWensite.module.css";
import { useLanguage, translate } from "../../context/LanguageContext";

function OpenWebsite({ redirectAfterDelay = true }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en, fa) => translate(language, en, fa);
  const data = "</>";
  useEffect(() => {
    // The splash page redirects; loading uses of this component do not.
    if (!redirectAfterDelay) return undefined;

    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, redirectAfterDelay]);

  return (
    <div className="animate__animated animate__fadeIn">
      <div className={styles.container}>
        <span className={styles.websiteicon}>{data}</span>
        <h1>
          Dev<span className={styles.websiteName}>Task</span>
        </h1>
        <span>{t("Plan · Build · Achieve", "برنامه‌ریزی · ساختن · پیشرفت")}</span>
        <span className={styles.textfoot}>
          {t("Your tasks · your progress · your success.", "وظایف شما · پیشرفت شما · موفقیت شما")}
        </span>
        <div className={styles.loader}></div>
      </div>
    </div>
  );
}

export default OpenWebsite;
