import { Routes, Route } from "react-router-dom";
import "animate.css";
import OpenWebsite from "./components/OpenWebsite/OpenWebsite";
import Home from "./page/Home/Home";
import Login from "./components/Account/login/Login";
import Register from "./components/Account/login/Register/Register";
import Tasks from "./page/Tasks/Tasks";
import AddTasks from "./page/Tasks/AddTasks/AddTasks";
import FilterTasks from "./page/Tasks/FilterTasks/FilterTasks";
import Profile from "./components/Profile/Profile";
import Stats from "./components/Stats/Stats";
import About from "./components/About/About";
import Support from "./components/Support/Support";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";

function AppContent() {
  const { isPersian } = useLanguage();
  return <div dir={isPersian ? "rtl" : "ltr"} lang={isPersian ? "fa" : "en"} className={isPersian ? "app-persian" : "app-english"}>
    <Routes>
      <Route path="/" element={<OpenWebsite />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/tasks/filterTasks" element={<FilterTasks />} />
      <Route path="/addTasks" element={<AddTasks />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/about" element={<About />} />
      <Route path="/support" element={<Support />} />
    </Routes>
  </div>;
}

export default function App() {
  return <LanguageProvider><AppContent /></LanguageProvider>;
}
