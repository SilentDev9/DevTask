import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import App from "./App.jsx";
import "@fortawesome/fontawesome-free/css/all.min.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
    <App />
  </BrowserRouter>,
);
