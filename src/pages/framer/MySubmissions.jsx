import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getMySubmissions } from "../../services/api";

function MySubmissions() {
  const navigate = useNavigate();

  const { accessToken } = useAuth();

  const [submissions, setSubmissions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSubmissions() {
      try {
        setErrorMessage("");

        const data = await getMySubmissions(accessToken);

        setSubmissions(data);
      } catch (error) {
        console.error(error);

        setErrorMessage(error.message || "Unable to load submissions.");
      } finally {
        setIsLoading(false);
      }
    }

    if (accessToken) {
      loadSubmissions();
    }
  }, [accessToken]);

  return (
    <div>
      <button type="button" onClick={() => navigate("/framer")}>
        Back
      </button>

      <h1>My Submissions</h1>

      {isLoading && <p>Loading submissions...</p>}

      {errorMessage && <p>{errorMessage}</p>}

      {!isLoading && submissions.length === 0 && (
        <p>You haven't submitted any safety forms yet.</p>
      )}

      {submissions.map((submission) => (
        <div key={submission.id}>
          <h2>{submission.sites?.name || "Unknown Site"}</h2>

          <p>Date: {submission.submission_date}</p>

          <p>Status: {submission.status}</p>

          <p>Submitted: {new Date(submission.created_at).toLocaleString()}</p>

          {submission.notes && <p>Notes: {submission.notes}</p>}

          <button
            type="button"
            onClick={() => navigate(`/framer/submissions/${submission.id}`)}
          >
            View Details
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default MySubmissions;
