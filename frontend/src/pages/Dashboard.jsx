import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// Override ChartJS text color for the light theme
ChartJS.defaults.color = "#64748b";

function Dashboard() {
  const [data, setData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", topic: "", difficulty: "", platform: "" });
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/dashboard");
        setData(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    const fetchStreak = async () => {
      try {
        const res = await API.get("/user/streak");
        setStreakData(res.data.data);
        setGoalInput(res.data.data.dailyGoal);
      } catch (error) {
        console.log("Failed to fetch streak info", error);
      }
    };
    fetchData();
    fetchStreak();
  }, [navigate]);

  if (!data) return (
    <div className="flex" style={{ justifyContent: "center", paddingTop: "60px" }}>
      <p style={{ fontSize: "16px", color: "var(--text-muted)", fontWeight: "500" }}>Loading dashboard...</p>
    </div>
  );


  const difficultyData = {
    labels: Object.keys(data.difficultyCount),
    datasets: [{
      data: Object.values(data.difficultyCount),
      backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
      borderWidth: 0,
    }],
  };

  const topicData = {
    labels: Object.keys(data.topicCount),
    datasets: [{
      data: Object.values(data.topicCount),
      backgroundColor: ["#3b82f6", "#a855f7", "#f97316", "#06b6d4"],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { padding: 15, usePointStyle: true, boxWidth: 8 }
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/dsa/${id}`);
      setData((prev) => ({
        ...prev,
        recent: prev.recent.filter((p) => p._id !== id),
        total: prev.total - 1,
      }));
      toast.info("Problem deleted successfully");
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditClick = (problem) => {
    setEditingId(problem._id);
    setEditForm(problem);
  };

  const handleUpdate = async () => {
    try {
      const res = await API.put(`/dsa/${editingId}`, editForm);
      setData((prev) => ({
        ...prev,
        recent: prev.recent.map((p) => p._id === editingId ? res.data : p),
      }));
      setEditingId(null);
      toast.success("Problem updated successfully");
    } catch (error) {
      console.log(error);
    }
  };

  const saveGoal = async () => {
    try {
      const g = Number(goalInput);
      if(isNaN(g) || g < 0) return toast.error("Invalid goal");

      await API.put("/user/goal", { dailyGoal: g });
      setStreakData((prev) => ({ ...prev, dailyGoal: g }));
      setIsEditingGoal(false);
      toast.success("Goal updated");
    } catch (error) {
      toast.error("Failed to set goal");
    }
  };

  return (
    <div className="max-w-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: "28px" }}>Overview</h1>
          <p style={{ marginTop: "4px" }}>Manage and track your DSA progress.</p>
        </div>
      </div>

      {streakData && (
        <div className="saas-card mb-6 flex mobile-col mobile-gap" style={{ padding: "20px 30px", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <h3 style={{ color: "var(--text-muted)", fontSize: "12px", textTransform: "uppercase", fontWeight: "600", letterSpacing: "1px" }}>Daily Goal</h3>
            {isEditingGoal ? (
              <div className="flex gap-2 items-center mobile-col" style={{ marginTop: "8px" }}>
                <input 
                  type="number" 
                  className="saas-input" 
                  style={{ width: "80px", padding: "6px" }} 
                  value={goalInput} 
                  onChange={e => setGoalInput(e.target.value)} 
                  min="0"
                />
                <div className="flex gap-2 w-full mobile-w-full justify-center">
                  <button onClick={saveGoal} className="btn-primary" style={{ padding: "6px 12px", flex: 1 }}>Save</button>
                  <button onClick={() => setIsEditingGoal(false)} className="btn-ghost" style={{ padding: "6px", flex: 1 }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 items-center" style={{ marginTop: "4px" }}>
                <span style={{ fontSize: "20px", fontWeight: "700" }}>{streakData.dailyGoal} problems</span>
                <button onClick={() => setIsEditingGoal(true)} className="btn-ghost" style={{ padding: "4px 8px", fontSize: "12px" }}>Edit</button>
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: "200px", maxWidth: "400px" }}>
            <div className="flex justify-between items-center mb-2">
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)" }}>Today's Progress</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: streakData.todayCount >= streakData.dailyGoal && streakData.dailyGoal > 0 ? "#10b981" : "var(--text-main)" }}>
                {streakData.todayCount} / {streakData.dailyGoal > 0 ? streakData.dailyGoal : "No goal"}
                {streakData.todayCount >= streakData.dailyGoal && streakData.dailyGoal > 0 && " 🔥"}
              </span>
            </div>
            <div style={{ width: "100%", height: "8px", backgroundColor: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ 
                height: "100%", 
                backgroundColor: streakData.todayCount >= streakData.dailyGoal && streakData.dailyGoal > 0 ? "#10b981" : "#3b82f6", 
                width: `${streakData.dailyGoal > 0 ? Math.min((streakData.todayCount / streakData.dailyGoal) * 100, 100) : 0}%`,
                transition: "width 0.4s ease, background-color 0.4s ease"
              }}></div>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", display: "inline-block" }}>
               {streakData.currentStreak > 0 ? "🔥" : "❄️"}
            </div>
            <div style={{ fontSize: "18px", fontWeight: "700", marginTop: "2px" }}>{streakData.currentStreak} Day Streak</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Longest: {streakData.longestStreak}</div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="saas-card hoverable flex items-center justify-between mobile-col" style={{ padding: "30px" }}>
          <div>
            <h3 style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Problems</h3>
            <div style={{ fontSize: "40px", fontWeight: "700", color: "var(--text-main)", marginTop: "8px" }}>{data.total}</div>
          </div>
          <div style={{ padding: "16px", background: "rgba(59, 130, 246, 0.1)", borderRadius: "16px" }}>
            <span style={{ fontSize: "28px" }}>📈</span>
          </div>
        </div>

        <div className="saas-card hoverable flex items-center justify-between mobile-col" style={{ padding: "30px" }}>
          <div>
            <h3 style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Best & Worst</h3>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#10b981" }}>↑ {data.skills?.strongestTopic || "N/A"}</div>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "#ef4444" }}>↓ {data.skills?.weakestTopic || "N/A"}</div>
            </div>
          </div>
          <div style={{ padding: "16px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "16px" }}>
            <span style={{ fontSize: "28px" }}>🎯</span>
          </div>
        </div>

        <div className="saas-card hoverable">
          <h3 className="mb-4" style={{ fontSize: "16px" }}>Difficulty Split</h3>
          <div style={{ height: "180px" }}>
            {Object.keys(data.difficultyCount).length > 0 ? (
              <Pie data={difficultyData} options={chartOptions} />
            ) : (
              <p className="text-center" style={{ marginTop: "70px", fontSize: "14px" }}>No data yet</p>
            )}
          </div>
        </div>

        <div className="saas-card hoverable">
          <h3 className="mb-4" style={{ fontSize: "16px" }}>Top Topics</h3>
          <div style={{ height: "180px" }}>
            {Object.keys(data.topicCount).length > 0 ? (
              <Pie data={topicData} options={chartOptions} />
            ) : (
              <p className="text-center" style={{ marginTop: "70px", fontSize: "14px" }}>No data yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="saas-card mt-6" style={{ background: "linear-gradient(135deg, #eef2ff, #ffffff)" }}>
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ fontSize: "18px", color: "#4f46e5" }}>🧠 AI Weakness Tracking</h3>
          <button 
            disabled={loading}
            onClick={async () => {
              try {
                setLoading(true);
                toast.info("Generating AI insights...");
                const res = await API.get("/analytics/insights");
                if (res.data.success) {
                   toast.success("AI Insights updated");
                   setAiInsights(res.data.data.aiAnalysis);
                }
              } catch(e) {
                toast.error("Failed to load AI insights");
              } finally {
                setLoading(false);
              }
            }} 
            className="btn-outline" 
            style={{ fontSize: "13px", padding: "6px 12px" }}>
            {loading ? "Analyzing..." : "Analyze Weaknesses"}
          </button>
        </div>
        
        {aiInsights ? (
          <div style={{ marginTop: "15px", padding: "15px", background: "#ffffff", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
            <div style={{ marginBottom: "12px" }}>
              <strong style={{ display: "block", marginBottom: "5px", color: "#4f46e5", fontSize: "14px" }}>Weak Areas:</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {aiInsights.weaknesses?.map((w, i) => (
                  <span key={i} style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
                    {w}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <strong style={{ display: "block", marginBottom: "5px", color: "#4f46e5", fontSize: "14px" }}>Strategy:</strong>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>{aiInsights.insights}</p>
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Click to analyze your solved problems and find out where you need to focus.
          </p>
        )}
      </div>

      <div className="saas-card mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ fontSize: "18px" }}>Recent Solved</h3>
        </div>

        {data.recent.length === 0 ? (
          <div className="text-center" style={{ padding: "40px 0" }}>
            <span style={{ fontSize: "40px", opacity: 0.5 }}>📝</span>
            <p style={{ marginTop: "12px", fontWeight: "500" }}>No problems added yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data.recent.map((p) => (
              <div key={p._id} className="problem-item">
                {editingId === p._id ? (
                  <div className="flex gap-2 w-full mobile-col" style={{ flexWrap: "wrap", alignItems: "center" }}>
                    <input name="title" className="saas-input mobile-w-full" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} style={{ flex: 2, padding: "8px" }} />
                    <input name="topic" className="saas-input mobile-w-full" value={editForm.topic} onChange={e => setEditForm({ ...editForm, topic: e.target.value })} style={{ flex: 1, padding: "8px" }} />
                    <select name="difficulty" className="saas-input mobile-w-full" value={editForm.difficulty} onChange={e => setEditForm({ ...editForm, difficulty: e.target.value })} style={{ flex: 1, padding: "8px" }}>
                      <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                    </select>
                    <input name="platform" className="saas-input mobile-w-full" value={editForm.platform} onChange={e => setEditForm({ ...editForm, platform: e.target.value })} style={{ flex: 1, padding: "8px" }} />
                    
                    <div className="flex gap-2 mobile-w-full">
                      <button onClick={handleUpdate} className="btn-primary mobile-w-full" style={{ padding: "8px 16px", flex: 1 }}>Save</button>
                      <button onClick={() => setEditingId(null)} className="btn-ghost mobile-w-full" style={{ padding: "8px 16px", flex: 1 }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="problem-title">{p.title}</div>
                      <div className="problem-meta">
                        <span className={`badge ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                        <span>{p.topic}</span>
                        <span>•</span>
                        <span>{p.platform}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditClick(p)} className="btn-ghost">Edit</button>
                      <button onClick={() => handleDelete(p._id)} className="btn-ghost" style={{ color: "var(--danger-bg)" }}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;