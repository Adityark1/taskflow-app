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

export default function App() {
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
      </div>
    </Router>
  );
}