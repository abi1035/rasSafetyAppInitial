import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getSubmissionById } from "../../services/api";

function SubmissionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { accessToken } = useAuth();

  const [submission, setSubmission] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadSubmission() {
      try {
        setErrorMessage("");

        const data = await getSubmissionById(
          accessToken,
          id,
        );

        setSubmission(data);
      } catch (error) {
        console.error(error);

        setErrorMessage(
          error.message ||
            "Unable to load submission.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (accessToken && id) {
      loadSubmission();
    }
  }, [accessToken, id]);

  function displayCheck(value) {
    return value ? "Yes" : "No";
  }

  if (isLoading) {
    return <p>Loading submission...</p>;
  }

  if (errorMessage) {
    return (
      <div>
        <button
          type="button"
          onClick={() =>
            navigate("/framer/submissions")
          }
        >
          Back
        </button>

        <p>{errorMessage}</p>
      </div>
    );
  }

  if (!submission) {
    return null;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          navigate("/framer/submissions")
        }
      >
        Back
      </button>

      <h1>Safety Form Details</h1>

      <section>
        <h2>Job Information</h2>

        <p>
          <strong>Site:</strong>{" "}
          {submission.sites?.name}
        </p>

        <p>
          <strong>Date:</strong>{" "}
          {submission.submission_date}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {submission.status}
        </p>

        <p>
          <strong>Submitted:</strong>{" "}
          {new Date(
            submission.created_at,
          ).toLocaleString()}
        </p>
      </section>

      <section>
        <h2>
          Personal Protective Equipment
        </h2>

        <p>
          Hard hat:{" "}
          {displayCheck(submission.hard_hat)}
        </p>

        <p>
          Safety vest:{" "}
          {displayCheck(submission.safety_vest)}
        </p>

        <p>
          Safety boots:{" "}
          {displayCheck(submission.safety_boots)}
        </p>

        <p>
          Eye protection:{" "}
          {displayCheck(
            submission.eye_protection,
          )}
        </p>
      </section>

      <section>
        <h2>Site Safety Checks</h2>

        <p>
          Fall protection:{" "}
          {displayCheck(
            submission.fall_protection,
          )}
        </p>

        <p>
          Ladders / scaffolding inspected:{" "}
          {displayCheck(
            submission
              .ladders_scaffolding_inspected,
          )}
        </p>

        <p>
          Tools / cords in good condition:{" "}
          {displayCheck(
            submission
              .tools_cords_good_condition,
          )}
        </p>

        <p>
          Hazards identified / reported:{" "}
          {displayCheck(
            submission.hazards_identified,
          )}
        </p>
      </section>

      <section>
        <h2>Notes</h2>

        <p>
          {submission.notes ||
            "No additional notes."}
        </p>
      </section>
<section>
  <h2>Photos</h2>

  {submission.photos?.length === 0 && (
    <p>No photos were attached to this submission.</p>
  )}

  {submission.photos?.length > 0 && (
    <div>
      {submission.photos.map((photo) => (
        <div key={photo.id}>
          <img
            src={photo.url}
            alt={photo.file_name}
            style={{
              width: "100%",
              maxWidth: "500px",
              height: "auto",
            }}
          />

          <p>{photo.file_name}</p>
        </div>
      ))}
    </div>
  )}
</section>
    </div>
  );
}

export default SubmissionDetails;