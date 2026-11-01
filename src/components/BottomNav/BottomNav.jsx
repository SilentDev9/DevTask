import { NavLink } from "react-router-dom";
import styles from "./BottomNav.module.css";
import { useLanguage, translate } from "../../context/LanguageContext";
import LanguageToggle from "../LanguageToggle/LanguageToggle";

function BottomNav() {
  const { language } = useLanguage();
  const t = (en, fa) => translate(language, en, fa);
  return (
    <div className={styles.container}>
      <ul className={styles.bottomNav}>
        <li>
          <NavLink
            to="/home"
            end
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            <i className="fa fa-home" aria-hidden="true"></i>
            <span>{t("Home", "خانه")}</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            <i className="fa fa-tasks" aria-hidden="true"></i>
            <span>{t("Tasks", "تسک‌ها")}</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/stats"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            <i className="fa fa-bar-chart" aria-hidden="true"></i>
            <span>{t("Stats", "آمار")}</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            <i className="fa fa-user" aria-hidden="true"></i>
            <span>{t("Profile", "پروفایل")}</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default BottomNav;
