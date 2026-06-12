import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
} from "react-router-dom";

import "./App.css";

import TasksPage from "./pages/TasksPage";
import CategoriesPage from "./pages/CategoriesPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";

// 1. IMPORT THE GLOBAL WIDGET: Bring in your premium AI panel
import AiFloatingWidget from "./components/AiFloatingWidget";

export default function App() {
  
  // 2. THE INTELLIGENT ROUTER BRIDGE:
  // When the AI processes a command, it runs this function. If the user happens to 
  // be sitting on the /dashboard route, it triggers the hidden DOM listener we added 
  // to fetch fresh backend metrics without forcing a heavy browser page reload.
  const handleGlobalAIRefresh = () => {
    const dashboardTrigger = document.getElementById("dashboard-refresh-trigger");
    if (dashboardTrigger) {
      dashboardTrigger.click();
    }
  };

  return (
    <Router>
      <div className="app-container">
        {/* Apple Glass Floating Nav Bar */}
        <nav className="top-nav">
          <h1 className="logo">TaskFlow</h1>

          <div className="nav-links">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/tasks">Tasks</NavLink>
            <NavLink to="/categories">Categories</NavLink>
            <NavLink to="/profile">Profile</NavLink>
          </div>
        </nav>

        {/* Global Content Viewport */}
        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/tasks" />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>

        {/* 3. MOUNT GLOBALLY: Locks the AI portal button to the bottom-right viewport across all routes */}
        <AiFloatingWidget onRefreshDashboard={handleGlobalAIRefresh} />
      </div>
    </Router>
  );
}