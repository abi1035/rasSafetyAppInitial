import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  getSites,
  createSubmission,
  uploadSubmissionPhotos,
} from "../../services/api";

function SafetyForm() {
  const navigate = useNavigate();

  const { profile, accessToken } = useAuth();

  const [sites, setSites] = useState([]);
  const [isLoadingSites, setIsLoadingSites] = useState(true);

  const [siteId, setSiteId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const [submissionDate, setSubmissionDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [hardHat, setHardHat] = useState(false);
  const [safetyVest, setSafetyVest] = useState(false);
  const [safetyBoots, setSafetyBoots] = useState(false);
  const [eyeProtection, setEyeProtection] = useState(false);
  const [photos, setPhotos] = useState([]);

  const [fallProtection, setFallProtection] = useState(false);

  const [laddersScaffoldingInspected, setLaddersScaffoldingInspected] =
    useState(false);

  const [toolsCordsGoodCondition, setToolsCordsGoodCondition] = useState(false);

  const [hazardsIdentified, setHazardsIdentified] = useState(false);

  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadSites() {
      try {
        const data = await getSites(accessToken);

        setSites(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingSites(false);
      }
    }

    if (accessToken) {
      loadSites();
    }
  }, [accessToken]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setMessage("");

      const formData = {
        siteId,
        submissionDate,
        hardHat,
        safetyVest,
        safetyBoots,
        eyeProtection,
        fallProtection,
        laddersScaffoldingInspected,
        toolsCordsGoodCondition,
        hazardsIdentified,
        notes,
      };

      const result = await createSubmission(accessToken, formData);

      if (photos.length > 0) {
  await uploadSubmissionPhotos(
    accessToken,
    result.submission.id,
    photos,
  );
}

      console.log("Created submission:", result);

      setMessage("Safety form submitted successfully!");
    } catch (error) {
      console.error("Submission error:", error);

      setMessage(error.message || "Unable to submit safety form.");
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <div>
      <button type="button" onClick={() => navigate("/framer")}>
        Back
      </button>

      <h1>Daily Safety Form</h1>

      <p>
        Worker: <strong>{profile?.full_name}</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <section>
          <h2>Job Information</h2>

          <div>
            <label htmlFor="site">Job Site</label>

            <select
              id="site"
              value={siteId}
              onChange={(event) => setSiteId(event.target.value)}
              required
              disabled={isLoadingSites}
            >
              <option value="">
                {isLoadingSites ? "Loading sites..." : "Select a job site"}
              </option>

              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="submissionDate">Date</label>

            <input
              id="submissionDate"
              type="date"
              value={submissionDate}
              onChange={(event) => setSubmissionDate(event.target.value)}
              required
            />
          </div>
        </section>

        <section>
          <h2>Personal Protective Equipment</h2>

          <label>
            <input
              type="checkbox"
              checked={hardHat}
              onChange={(event) => setHardHat(event.target.checked)}
            />
            Hard hat worn
          </label>

          <label>
            <input
              type="checkbox"
              checked={safetyVest}
              onChange={(event) => setSafetyVest(event.target.checked)}
            />
            Safety vest worn
          </label>

          <label>
            <input
              type="checkbox"
              checked={safetyBoots}
              onChange={(event) => setSafetyBoots(event.target.checked)}
            />
            Safety boots worn
          </label>

          <label>
            <input
              type="checkbox"
              checked={eyeProtection}
              onChange={(event) => setEyeProtection(event.target.checked)}
            />
            Eye protection worn
          </label>
        </section>

        <section>
          <h2>Site Safety Checks</h2>

          <label>
            <input
              type="checkbox"
              checked={fallProtection}
              onChange={(event) => setFallProtection(event.target.checked)}
            />
            Fall protection in place
          </label>

          <label>
            <input
              type="checkbox"
              checked={laddersScaffoldingInspected}
              onChange={(event) =>
                setLaddersScaffoldingInspected(event.target.checked)
              }
            />
            Ladders / scaffolding inspected
          </label>

          <label>
            <input
              type="checkbox"
              checked={toolsCordsGoodCondition}
              onChange={(event) =>
                setToolsCordsGoodCondition(event.target.checked)
              }
            />
            Tools and cords in good condition
          </label>

          <label>
            <input
              type="checkbox"
              checked={hazardsIdentified}
              onChange={(event) => setHazardsIdentified(event.target.checked)}
            />
            Hazards identified / reported
          </label>
        </section>

        <section>
          <h2>Notes</h2>

          <label htmlFor="notes">Additional notes</label>

          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows="5"
            placeholder="Describe hazards, site conditions, or anything the supervisor should know..."
          />
        </section>

        <section>
          <h2>Photos</h2>

          <label htmlFor="photos">Site safety photos</label>

          <input
            id="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => {
              const selectedPhotos = Array.from(event.target.files);

              if (selectedPhotos.length > 5) {
                setMessage("You can upload a maximum of 5 photos.");

                event.target.value = "";
                setPhotos([]);

                return;
              }

              const oversizedPhoto = selectedPhotos.find(
                (photo) => photo.size > 5 * 1024 * 1024,
              );

              if (oversizedPhoto) {
                setMessage(`${oversizedPhoto.name} is larger than 5 MB.`);

                event.target.value = "";
                setPhotos([]);

                return;
              }

              setMessage("");
              setPhotos(selectedPhotos);
            }}
          />

          {photos.length > 0 && (
            <div>
              <p>
                {photos.length} photo
                {photos.length !== 1 ? "s" : ""} selected
              </p>

              {photos.map((photo) => (
                <p key={`${photo.name}-${photo.size}`}>{photo.name}</p>
              ))}
            </div>
          )}
        </section>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Safety Form"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default SafetyForm;
