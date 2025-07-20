export const apiCall = async (
  url,
  method = "GET",
  data = null,
  token = null
) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`https://repairzone-backend.onrender.com`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  });

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Invalid JSON:", text);
    throw new Error("Invalid response from server.");
  }
};
