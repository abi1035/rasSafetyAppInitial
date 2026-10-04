const API_URL = "http://localhost:5000";

// ========================================================
// TEST API CONNECTION
// ========================================================

export async function testApiConnection() {
  const response = await fetch(`${API_URL}/`);

  if (!response.ok) {
    throw new Error("Unable to connect to server");
  }

  return response.json();
}

// ========================================================
// AUTH
// ========================================================

export async function getCurrentUser(token) {
  const response = await fetch(
    `${API_URL}/api/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to load user",
    );
  }

  return data;
}

// ========================================================
// SITES
// ========================================================

export async function getSites(token) {
  const response = await fetch(
    `${API_URL}/api/sites`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to load sites",
    );
  }

  return data;
}

// ========================================================
// CREATE SUBMISSION
// ========================================================

export async function createSubmission(
  token,
  formData,
) {
  const response = await fetch(
    `${API_URL}/api/submissions`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(formData),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to submit safety form",
    );
  }

  return data;
}

// ========================================================
// FRAMER SUBMISSIONS
// ========================================================

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
      data.message ||
        "Unable to load submissions",
    );
  }

  return data;
}

// ========================================================
// SINGLE FRAMER SUBMISSION
// ========================================================

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
      data.message ||
        "Unable to load submission",
    );
  }

  return data;
}

// ========================================================
// PHOTO UPLOAD
// ========================================================

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
      data.message ||
        "Unable to upload photos",
    );
  }

  return data;
}

// ========================================================
// ADMIN DASHBOARD
// ========================================================

export async function getAdminDashboard(
  token,
  filters = {},
) {
  const params = new URLSearchParams();

  if (filters.siteId) {
    params.append(
      "siteId",
      filters.siteId,
    );
  }

  if (filters.workerId) {
    params.append(
      "workerId",
      filters.workerId,
    );
  }

  if (filters.fromDate) {
    params.append(
      "fromDate",
      filters.fromDate,
    );
  }

  if (filters.toDate) {
    params.append(
      "toDate",
      filters.toDate,
    );
  }

  const queryString = params.toString();

  const url = queryString
    ? `${API_URL}/api/admin/dashboard?${queryString}`
    : `${API_URL}/api/admin/dashboard`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to load admin dashboard",
    );
  }

  return data;
}