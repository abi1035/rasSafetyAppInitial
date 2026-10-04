const API_URL = "http://localhost:5000";

export async function getCurrentUser(token) {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load user");
  }

  return data;
}

export async function getSites(token) {
  const response = await fetch(`${API_URL}/api/sites`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load sites");
  }

  return data;
}

export async function createSubmission(token, formData) {
  const response = await fetch(`${API_URL}/api/submissions`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to submit safety form",
    );
  }

  return data;
}

export async function getMySubmissions(token) {
  const response = await fetch(
    `${API_URL}/api/submissions/mine`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to load submissions",
    );
  }



  return data;
}

export async function getSubmissionById(
  token,
  submissionId,
) {
  const response = await fetch(
    `${API_URL}/api/submissions/${submissionId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to load submission",
    );
  }

  return data;
}

export async function uploadSubmissionPhotos(
  token,
  submissionId,
  photos,
) {
  const formData = new FormData();

  photos.forEach((photo) => {
    formData.append("photos", photo);
  });

  const response = await fetch(
    `${API_URL}/api/submissions/${submissionId}/photos`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to upload photos",
    );
  }

  return data;
}