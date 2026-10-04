import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function FramerDashboard() {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="framer-dashboard">
      <header>
        <div>
          <h1>RAS Safety Forms</h1>

          <p>
            Welcome, {profile?.full_name}
          </p>
        </div>

        <button onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main>
        <section>
          <h2>Site Safety</h2>

          <p>
            Complete your daily safety form before
            starting work.
          </p>
        </section>

        <section>
          <button
            onClick={() =>
              navigate("/framer/new-submission")
            }
          >
            Start Safety Form
          </button>

          <button
            onClick={() =>
              navigate("/framer/submissions")
            }
          >
            My Submissions
          </button>
        </section>
      </main>
    </div>
  );
}

export default FramerDashboard;