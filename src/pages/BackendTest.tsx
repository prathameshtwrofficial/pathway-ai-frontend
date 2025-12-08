import { useEffect, useState } from "react";

const BackendTest = () => {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:5000/api/hello") // backend API
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setMessage("❌ Error: " + err.message));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Frontend ↔ Backend Test</h1>
      <p>{message}</p>
    </div>
  );
};

export default BackendTest;
