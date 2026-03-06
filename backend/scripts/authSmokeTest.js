const axios = require("axios");

const BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api";
const TEST_EMAIL = process.env.TEST_EMAIL || "doctor.test@example.com";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "Password@123";

async function main() {
  try {
    const health = await axios.get("http://localhost:5000/health", { timeout: 8000 });
    console.log("HEALTH_OK:", health.data?.success === true);
  } catch (err) {
    console.error("Health check failed. Is backend running on :5000?");
    process.exit(1);
  }

  const registerPayload = {
    name: "Doctor Test",
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    phone: "9999999999",
    role: "doctor",
    gender: "male",
  };

  let registeredNow = false;
  try {
    await axios.post(`${BASE_URL}/auth/register`, registerPayload, { timeout: 12000 });
    registeredNow = true;
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data?.error || err.message;
    if (!String(message).includes("User already exists")) {
      console.error("Register failed:", message);
      process.exit(1);
    }
  }

  let loginResponse;
  try {
    loginResponse = await axios.post(
      `${BASE_URL}/auth/login`,
      { email: TEST_EMAIL, password: TEST_PASSWORD },
      { timeout: 12000 }
    );
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data?.error || err.message;
    console.error("Login failed:", message);
    process.exit(1);
  }

  console.log("REGISTERED_NOW:", registeredNow);
  console.log("LOGIN_OK:", loginResponse.data?.success === true);
  console.log("LOGIN_EMAIL:", loginResponse.data?.user?.email || "n/a");
  console.log("LOGIN_ROLE:", loginResponse.data?.user?.role || "n/a");
  console.log("TOKEN_PRESENT:", Boolean(loginResponse.data?.token));
}

main();
