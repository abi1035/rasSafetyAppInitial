import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getAdminDashboard } from "../../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const {
    profile,
    accessToken,
    logout,
  } = useAuth();

  const [submissions, setSubmissions] = useState([]);

  const [summary, setSummary] = useState({
    totalSubmissions: 0,
    todaySubmissions: 0,
    totalSites: 0,
    totalWorkers: 0,
  });

  const [workers, setWorkers] = useState([]);
  const [sites, setSites] = useState([]);

  const [siteFilter, setSiteFilter] = useState("");
  const [workerFilter, setWorkerFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard(filters = {}) {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getAdminDashboard(
        accessToken,
        filters,
      );

      setSummary(data.summary);
      setSubmissions(data.submissions);

      setWorkers(
        data.filters?.workers || [],
      );

      setSites(
        data.filters?.sites || [],
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error.message ||
          "Unable to load dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken) {
      loadDashboard();
    }
  }, [accessToken]);

  function handleApplyFilters(event) {
    event.preventDefault();

    if (
      fromDate &&
      toDate &&
      fromDate > toDate
    ) {
      setErrorMessage(
        "From date cannot be later than To date.",
      );
      return;
    }

    loadDashboard({
      siteId: siteFilter,
      workerId: workerFilter,
      fromDate,
      toDate,
    });
  }

  function handleClearFilters() {
    setSiteFilter("");
    setWorkerFilter("");
    setFromDate("");
    setToDate("");
    setErrorMessage("");

    loadDashboard();
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  if (isLoading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div>
      <header>
        <div>
          <h1>RAS Safety Administration</h1>

          <p>
            Welcome, {profile?.full_name}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main>
        <section>
          <h2>Dashboard Summary</h2>

          <div>
            <div>
              <h3>{summary.todaySubmissions}</h3>
              <p>Submitted Today</p>
            </div>

            <div>
              <h3>{summary.totalSubmissions}</h3>
              <p>Total Submissions</p>
            </div>

            <div>
              <h3>{summary.totalWorkers}</h3>
              <p>Workers</p>
            </div>

            <div>
              <h3>{summary.totalSites}</h3>
              <p>Sites</p>
            </div>
          </div>
        </section>

        <section>
          <h2>Safety Form Submissions</h2>

          <form onSubmit={handleApplyFilters}>
            <div>
              <label htmlFor="siteFilter">
                Site
              </label>

              <select
                id="siteFilter"
                value={siteFilter}
                onChange={(event) =>
                  setSiteFilter(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  All Sites
                </option>

                {sites.map((site) => (
                  <option
                    key={site.id}
                    value={site.id}
                  >
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="workerFilter">
                Worker
              </label>

              <select
                id="workerFilter"
                value={workerFilter}
                onChange={(event) =>
                  setWorkerFilter(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  All Workers
                </option>

                {workers.map((worker) => (
                  <option
                    key={worker.id}
                    value={worker.id}
                  >
                    {worker.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fromDate">
                From
              </label>

              <input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(event) =>
                  setFromDate(
                    event.target.value,
                  )
                }
              />
            </div>

            <div>
              <label htmlFor="toDate">
                To
              </label>

              <input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(event) =>
                  setToDate(
                    event.target.value,
                  )
                }
              />
            </div>

            <button type="submit">
              Apply Filters
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </form>

          {errorMessage && (
            <p>{errorMessage}</p>
          )}

          {submissions.length === 0 && (
            <p>
              No safety form submissions found.
            </p>
          )}

          {submissions.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Site</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>

              <tbody>
                {submissions.map(
                  (submission) => (
                    <tr key={submission.id}>
                      <td>
                        {submission.profiles
                          ?.full_name ||
                          "Unknown Worker"}
                      </td>

                      <td>
                        {submission.sites
                          ?.name ||
                          "Unknown Site"}
                      </td>

                      <td>
                        {
                          submission.submission_date
                        }
                      </td>

                      <td>
                        {submission.status}
                      </td>

                      <td>
                        {new Date(
                          submission.created_at,
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;