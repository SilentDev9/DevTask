import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import styles from "./BottomNav.module.css";
import { useLanguage, translate } from "../../context/LanguageContext";
import LanguageToggle from "../LanguageToggle/LanguageToggle";

export default function BottomNav() {
  const { language } = useLanguage();
  const t = (en, fa) => translate(language, en, fa);
  const [moreOpen, setMoreOpen] = useState(false);
  const navItems = [
    ["/home", "fa-home", "Home", "خانه"],
    ["/tasks", "fa-tasks", "Tasks", "وظایف"],
    ["/stats", "fa-bar-chart", "Stats", "آمار"],
    ["/profile", "fa-user", "Profile", "پروفایل"],
  ];
  return <>
    {moreOpen && <><button className={styles.menuScrim} aria-label={t("Close menu", "بستن منو")} onClick={() => setMoreOpen(false)} /><nav className={styles.moreMenu} aria-label={t("More pages", "صفحات بیشتر")}>
      <Link to="/about" onClick={() => setMoreOpen(false)}><i className="fa fa-info-circle" />{t("About", "درباره ما")}</Link>
      <Link to="/support" onClick={() => setMoreOpen(false)}><i className="fa fa-life-ring" />{t("Support", "پشتیبانی")}</Link>
      <div className={styles.languageRow}><span>{t("Language", "زبان")}</span><LanguageToggle /></div>
    </nav></>}
    <div className={styles.container}><ul className={styles.bottomNav}>
      {navItems.map(([to, icon, en, fa]) => <li key={to}><NavLink to={to} className={({isActive}) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}><i className={`fa ${icon}`} aria-hidden="true"/><span>{t(en, fa)}</span></NavLink></li>)}
      <li><button type="button" className={`${styles.navLink} ${moreOpen ? styles.active : ""}`} onClick={() => setMoreOpen(v => !v)} aria-expanded={moreOpen}><i className="fa fa-ellipsis-h"/><span>{t("More", "بیشتر")}</span></button></li>
    </ul></div>
  </>;
}
