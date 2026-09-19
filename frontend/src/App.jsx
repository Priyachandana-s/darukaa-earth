import { useEffect, useState } from "react";
import "./App.css";
import MapView from "./MapView";
import api from "./api";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [message, setMessage] = useState("");

  // Remember login after refresh
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [isRegister, setIsRegister] = useState(false);

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // -----------------------------
  // Login
  // -----------------------------
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem(
        "token",
        response.data.access_token
      );

      setLoggedIn(true);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Login failed"
      );
    }
  };

  // -----------------------------
  // Register
  // -----------------------------
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      setMessage(
        "Registration successful! Please login."
      );

      setName("");
      setEmail("");
      setPassword("");

      setIsRegister(false);
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
        "Registration failed"
      );
    }
  };

  // -----------------------------
  // Fetch Projects
  // -----------------------------
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
      console.error(
        "Error fetching projects:",
        error
      );

      // Token is invalid/expired
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setLoggedIn(false);
      }
    }
  };

  // -----------------------------
  // Load projects after login
  // -----------------------------
  useEffect(() => {
    if (loggedIn) {
      fetchProjects();
    }
  }, [loggedIn]);

  // -----------------------------
  // Create Project
  // -----------------------------
  const handleCreateProject = async (e) => {
    e.preventDefault();

    if (!projectName.trim()) return;

    try {
      const response = await api.post(
        "/projects/",
        {
          name: projectName,
          description: projectDescription,
        }
      );

      setProjectName("");
      setProjectDescription("");

      setSelectedProject(response.data);

      fetchProjects();
    } catch (error) {
      console.error(
        "Error creating project:",
        error
      );
    }
  };

  // -----------------------------
  // Logout
  // -----------------------------
  const handleLogout = () => {
    localStorage.removeItem("token");

    setLoggedIn(false);
    setEmail("");
    setPassword("");
    setProjects([]);
    setSelectedProject(null);
  };

  // -----------------------------
  // Dashboard
  // -----------------------------
  if (loggedIn) {
    return (
      <div className="dashboard">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1>Darukaa.Earth</h1>
            <h2>Project Dashboard</h2>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "6px",
              background: "#555",
              color: "white",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        {/* Create Project */}
        <div className="dashboard-card">
          <h3>Create New Project</h3>

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

            <button type="submit">
              Create Project
            </button>
          </form>
        </div>

        {/* Projects */}
        <div className="dashboard-card">
          <h3>Projects</h3>

          {projects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            <>
              <select
                value={selectedProject?.id || ""}
                onChange={(e) => {
                  const project = projects.find(
                    (item) =>
                      item.id ===
                      Number(e.target.value)
                  );

                  setSelectedProject(project);
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  marginBottom: "15px",
                }}
              >
                {projects.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name}
                  </option>
                ))}
              </select>

              {selectedProject && (
                <div>
                  <h4>
                    {selectedProject.name}
                  </h4>

                  <p>
                    {selectedProject.description}
                  </p>

                  <p>
                    <strong>
                      Project ID:
                    </strong>{" "}
                    {selectedProject.id}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Map */}
        <div className="dashboard-card">
          <h3>Project Map</h3>

          {selectedProject ? (
            <>
              <p>
                Drawing sites for:
                <strong>
                  {" "}
                  {selectedProject.name}
                </strong>
              </p>

              <MapView
                projectId={selectedProject.id}
              />
            </>
          ) : (
            <p>
              Create a project first to add
              geographical sites.
            </p>
          )}
        </div>

      </div>
    );
  }

  // -----------------------------
  // Login / Register
  // -----------------------------
  return (
    <div className="login-container">

      <h1>Darukaa.Earth</h1>

      <h2>
        {isRegister
          ? "Create Account"
          : "Login"}
      </h2>

      <form
        onSubmit={
          isRegister
            ? handleRegister
            : handleLogin
        }
      >

        {isRegister && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        <button type="submit">
          {isRegister
            ? "Register"
            : "Login"}
        </button>

      </form>

      {message && (
        <p>{message}</p>
      )}

      <p style={{ marginTop: "20px" }}>
        {isRegister
          ? "Already have an account?"
          : "Don't have an account?"}

        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage("");
          }}
          style={{
            marginLeft: "8px",
            border: "none",
            background: "none",
            color: "#2e7d32",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {isRegister
            ? "Login"
            : "Register"}
        </button>
      </p>

    </div>
  );
}

export default App;