import { useState } from "react";
import API from "../services/api";

function MockInterview() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [interviewData, setInterviewData] = useState(null);

  const generateInterview = async () => {
    if (!company || !role) return alert("Please enter company and role.");
    setLoading(true);
    try {
      const res = await API.post("/mock-interview/generate-questions", { company, role });
      if (res.data.success) {
        setInterviewData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate mock interview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-900" style={{ marginTop: "30px" }}>
      <h2 style={{ marginBottom: "20px" }}>🎙️ Mock Interview Mode</h2>
      <div className="saas-card" style={{ marginBottom: "30px" }}>
        <p style={{ marginBottom: "15px", color: "var(--text-muted)" }}>
          Simulate a real technical interview tailored to your target company and role.
        </p>
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Company (e.g., Amazon, Google)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="saas-input"
          />
          <input
            type="text"
            placeholder="Role (e.g., Frontend Engineer)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="saas-input"
          />
        </div>
        <button className="btn-primary" onClick={generateInterview} disabled={loading}>
          {loading ? "Generating Interview..." : "Start Mock Interview"}
        </button>
      </div>

      {interviewData && (
        <div className="saas-card">
          <h3 style={{ marginBottom: "15px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
            HR & Behavioral Questions
          </h3>
          <ul style={{ marginBottom: "20px", paddingLeft: "20px", color: "var(--text-muted)" }}>
            {interviewData.hrQuestions?.map((q, i) => (
              <li key={i} style={{ marginBottom: "12px" }}>
                <strong style={{ color: "var(--text-main)" }}>{typeof q === "string" ? q : q.question}</strong>
                {typeof q === "object" && q.expectedAnswer && (
                  <p style={{ marginTop: "4px", fontSize: "14px", color: "var(--text-muted)" }}>
                    <em>Hint:</em> {q.expectedAnswer}
                  </p>
                )}
              </li>
            ))}
          </ul>

          <h3 style={{ marginBottom: "15px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
            Technical Core Questions
          </h3>
          <ul style={{ marginBottom: "20px", paddingLeft: "20px", color: "var(--text-muted)" }}>
            {interviewData.technicalQuestions?.map((q, i) => (
              <li key={i} style={{ marginBottom: "12px" }}>
                <strong style={{ color: "var(--text-main)" }}>{typeof q === "string" ? q : q.question}</strong>
                {typeof q === "object" && q.expectedAnswer && (
                  <p style={{ marginTop: "4px", fontSize: "14px", color: "var(--text-muted)" }}>
                    <em>Hint:</em> {q.expectedAnswer}
                  </p>
                )}
              </li>
            ))}
          </ul>

          <h3 style={{ marginBottom: "15px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
            DSA Questions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {interviewData.dsaQuestions?.map((q, i) => (
              <div key={i} style={{ padding: "15px", background: "#f8fafc", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <strong style={{ color: "var(--text-main)" }}>{q.title}</strong>
                  <span style={{ fontSize: "12px", background: "#e2e8f0", padding: "4px 8px", borderRadius: "4px" }}>
                    {q.difficulty}
                  </span>
                </div>
                <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "8px" }}>Topic: {q.topic}</div>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>{q.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MockInterview;
