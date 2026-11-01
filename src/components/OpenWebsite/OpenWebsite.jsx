import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./OpenWensite.module.css";

function OpenWebsite({ redirectAfterDelay = true }) {
  const navigate = useNavigate();
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
        <span>Plan . Build . Achieve</span>
        <span className={styles.textfoot}>
          Your tasks . your progress . your success.
        </span>
        <div className={styles.loader}></div>
      </div>
    </div>
  );
}

export default OpenWebsite;
