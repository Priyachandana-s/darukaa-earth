import { useEffect, useState } from "react";
import "./App.css";
import MapView from "./MapView";
import api from "./api";
import {
  Leaf,
  Map,
  FolderKanban,
  BarChart3,
  LogOut,
  Plus,
  ArrowRight,
} from "lucide-react";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [isRegister, setIsRegister] = useState(false);

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [sites, setSites] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.access_token);
      setLoggedIn(true);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Login failed"
      );
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      setMessage("Registration successful! Please login.");
      setName("");
      setEmail("");
      setPassword("");
      setIsRegister(false);
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Registration failed"
      );
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects/");

      setProjects(response.data);

      if (response.data.length > 0) {
        setSelectedProject(response.data[0]);
      } else {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setLoggedIn(false);
      }
    }
  };

  const fetchSites = async () => {
    try {
      const response = await api.get("/sites/");
      setSites(response.data);
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      fetchProjects();
      fetchSites();
    }
  }, [loggedIn]);

  const handleCreateProject = async (e) => {
    e.preventDefault();

    if (!projectName.trim()) return;

    try {
      const response = await api.post("/projects/", {
        name: projectName,
        description: projectDescription,
      });

      setProjectName("");
      setProjectDescription("");

      setSelectedProject(response.data);

      await fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setEmail("");
    setPassword("");
    setProjects([]);
    setSelectedProject(null);
    setSites([]);
  };

  const projectSites = selectedProject
    ? sites.filter(
        (site) => site.project_id === selectedProject.id
      )
    : [];

  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="brand-icon">
            <Leaf size={32} />
          </div>

          <h1>Darukaa.Earth</h1>

          <p className="login-subtitle">
            Geospatial Carbon & Biodiversity Platform
          </p>

          <h2>
            {isRegister ? "Create your account" : "Welcome back"}
          </h2>

          <p className="form-description">
            {isRegister
              ? "Create an account to manage your projects."
              : "Sign in to access your environmental projects."}
          </p>

          <form
            onSubmit={
              isRegister ? handleRegister : handleLogin
            }
          >
            {isRegister && (
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="primary-button">
              {isRegister ? "Create Account" : "Sign In"}
            </button>
          </form>

          {message && (
            <p className="auth-message">{message}</p>
          )}

          <div className="switch-auth">
            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setMessage("");
              }}
            >
              {isRegister ? "Sign in" : "Create one"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="brand-small-icon">
            <Leaf size={22} />
          </div>

          <div>
            <h2>Darukaa</h2>
            <span>.Earth</span>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">WORKSPACE</p>

          <button className="sidebar-link active">
            <FolderKanban size={18} />
            Projects
          </button>

          <button className="sidebar-link">
            <Map size={18} />
            Map Explorer
          </button>

          <button className="sidebar-link">
            <BarChart3 size={18} />
            Analytics
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">
              {email.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>Admin</strong>
              <span>{email}</span>
            </div>
          </div>

          <button
            className="logout-link"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* TOP BAR */}
        <header className="topbar">
          <div>
            <p className="eyebrow">ENVIRONMENTAL PLATFORM</p>

            <h1>Project Dashboard</h1>

            <p className="topbar-subtitle">
              Manage your carbon and biodiversity projects
            </p>
          </div>

          <button
            className="new-project-button"
            onClick={() =>
              document
                .getElementById("create-project")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <Plus size={18} />
            New Project
          </button>
        </header>

        {/* STAT CARDS */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">
              <FolderKanban size={22} />
            </div>

            <div>
              <span>Total Projects</span>
              <strong>{projects.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Map size={22} />
            </div>

            <div>
              <span>Total Sites</span>
              <strong>{sites.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <BarChart3 size={22} />
            </div>

            <div>
              <span>Tracked Metrics</span>
              <strong>2</strong>
            </div>
          </div>

        </section>

        <div className="dashboard-grid">

          {/* CREATE PROJECT */}
          <section
            className="dashboard-card create-card"
            id="create-project"
          >
            <div className="card-heading">
              <div>
                <span className="section-tag">
                  PROJECT MANAGEMENT
                </span>

                <h2>Create New Project</h2>

                <p>
                  Start a new environmental monitoring
                  project.
                </p>
              </div>

              <div className="card-icon">
                <Plus size={22} />
              </div>
            </div>

            <form onSubmit={handleCreateProject}>
              <input
                type="text"
                placeholder="Project name"
                value={projectName}
                onChange={(e) =>
                  setProjectName(e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Project description"
                value={projectDescription}
                onChange={(e) =>
                  setProjectDescription(e.target.value)
                }
              />

              <button
                type="submit"
                className="primary-button"
              >
                Create Project
                <ArrowRight size={18} />
              </button>
            </form>
          </section>

          {/* PROJECTS */}
          <section className="dashboard-card projects-card">

            <div className="card-heading">
              <div>
                <span className="section-tag">
                  YOUR WORKSPACE
                </span>

                <h2>Projects</h2>

                <p>
                  Select a project to explore its sites.
                </p>
              </div>

              <div className="card-icon">
                <FolderKanban size={22} />
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="empty-state">
                <FolderKanban size={38} />

                <h3>No projects yet</h3>

                <p>
                  Create your first project to start
                  mapping environmental sites.
                </p>
              </div>
            ) : (
              <div className="project-list">

                {projects.map((project) => (
                  <button
                    key={project.id}
                    className={`project-item ${
                      selectedProject?.id === project.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedProject(project)
                    }
                  >
                    <div className="project-item-icon">
                      <Leaf size={18} />
                    </div>

                    <div>
                      <strong>{project.name}</strong>

                      <span>
                        {project.description ||
                          "Environmental project"}
                      </span>
                    </div>

                    <ArrowRight size={18} />
                  </button>
                ))}

              </div>
            )}
          </section>

        </div>

        {/* MAP */}
        <section className="map-section dashboard-card">

          <div className="map-header">

            <div>
              <span className="section-tag">
                GEOSPATIAL ANALYSIS
              </span>

              <h2>Project Map</h2>

              {selectedProject ? (
                <p>
                  Mapping sites for{" "}
                  <strong>
                    {selectedProject.name}
                  </strong>
                </p>
              ) : (
                <p>
                  Create a project to begin mapping sites.
                </p>
              )}
            </div>

            {selectedProject && (
              <div className="site-count">
                <Map size={17} />
                {projectSites.length} site
                {projectSites.length !== 1 ? "s" : ""}
              </div>
            )}

          </div>

          {selectedProject ? (
            <MapView projectId={selectedProject.id} />
          ) : (
            <div className="map-placeholder">
              <Map size={48} />

              <h3>Your map will appear here</h3>

              <p>
                Create a project first, then draw
                geographical sites on the map.
              </p>
            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default App;