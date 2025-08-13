import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Chart.js registration
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type MoodDoc = {
  _id?: string;
  mood: "Happy" | "Neutral" | "Sad" | string;
  note?: string;
  date: string; // ISO from backend
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  const [moods, setMoods] = useState<MoodDoc[]>([]);
  const [mood, setMood] = useState<MoodDoc["mood"]>("Happy");
  const [note, setNote] = useState("");

  // Load existing moods
  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE}/mood`);
      const data = await res.json();
      setMoods(data);
    })();
  }, []);

  const addMood = async () => {
    if (!mood) return;
    const res = await fetch(`${API_BASE}/mood`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood, note }),
    });
    const saved = await res.json();
    setMoods((prev) => [...prev, saved]);
    setNote("");
  };


  // Chart data
  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    moods.forEach((m) => {
      counts[m.mood] = (counts[m.mood] || 0) + 1;
    });
    return counts;
  }, [moods]);

  const chartData = {
    labels: Object.keys(moodCounts),
    datasets: [
      {
        label: "Mood Frequency",
        data: Object.values(moodCounts),
        backgroundColor: [
          "#22c55e", // Happy - green
          "#6b7280", // Neutral - gray
          "#facc15", // Sad - yellow
          "#3b82f6", // Default - blue
          "#a855f7", // Extra moods
          "#f97316"
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Mood Distribution" },
    },
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>😊 Mood Tracker</h1>
        <p style={styles.subtitle}>
          Log your mood and notes, stored in MongoDB Atlas.
        </p>
      </header>

      <main style={styles.main}>
        {/* Add form */}
        <div style={styles.formCard}>
          <div style={styles.formRow}>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              style={styles.select}
            >
              <option>Happy</option>
              <option>Neutral</option>
              <option>Sad</option>
              <option>Excited</option>
              <option>Calm</option>
              <option>Stressed</option>
            </select>

            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note…"
              style={styles.input}
            />

            <button
              onClick={addMood}
              style={{ ...styles.button, backgroundColor: moodColorMap[mood] || "#3b82f6" }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Chart */}
        {moods.length > 0 && (
          <div style={{ background: "#1f2937", padding: "1rem", borderRadius: "12px", marginTop: "1.5rem" }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}

        {/* History */}
        <h2 style={styles.historyTitle}>History</h2>
        {moods.length === 0 ? (
          <p style={styles.noEntries}>No entries yet.</p>
        ) : (
          <ul style={styles.historyList}>
            {moods.map((m) => (
              <li key={m._id ?? `${m.mood}-${m.date}`} style={styles.historyItem}>
                <div style={styles.historyLeft}>
                  <span style={styles.emoji}>
                    {m.mood === "Happy" ? "😊" :
                     m.mood === "Sad" ? "😔" :
                     m.mood === "Neutral" ? "😐" : "🙂"}
                  </span>
                  <div>
                    <div style={styles.moodText}>{m.mood}</div>
                    {m.note ? <div style={styles.noteText}>{m.note}</div> : null}
                  </div>
                </div>
                <div style={styles.dateText}>
                  {new Date(m.date).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

// Color mapping for moods
const moodColorMap: Record<string, string> = {
  Happy: "#22c55e",
  Neutral: "#6b7280",
  Sad: "#facc15",
  Excited: "#3b82f6",
  Calm: "#a855f7",
  Stressed: "#f97316",
};

// Inline styles
const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: "100vh",
    backgroundColor: "#111827",
    color: "white",
    fontFamily: "sans-serif",
    paddingBottom: "2rem",
  },
  header: {
    maxWidth: "768px",
    margin: "0 auto",
    padding: "2rem 1.5rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
  },
  subtitle: {
    color: "#9ca3af",
    marginTop: "0.5rem",
  },
  main: {
    maxWidth: "768px",
    margin: "0 auto",
    padding: "0 1.5rem",
  },
  formCard: {
    backgroundColor: "rgba(31, 41, 55, 0.7)",
    borderRadius: "1rem",
    padding: "1rem",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  formRow: {
    display: "flex",
    flexDirection: "row",
    gap: "0.75rem",
  },
  select: {
    backgroundColor: "#111827",
    border: "1px solid #374151",
    borderRadius: "0.75rem",
    padding: "0.5rem",
    color: "white",
  },
  input: {
    flex: 1,
    backgroundColor: "#111827",
    border: "1px solid #374151",
    borderRadius: "0.75rem",
    padding: "0.5rem",
    color: "white",
  },
  button: {
    borderRadius: "0.75rem",
    padding: "0.5rem 1rem",
    fontWeight: 600,
    color: "white",
    cursor: "pointer",
    transition: "opacity 0.3s",
  },
  historyTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    marginTop: "2rem",
    marginBottom: "0.75rem",
  },
  noEntries: {
    color: "#9ca3af",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    padding: 0,
    listStyle: "none",
  },
  historyItem: {
    backgroundColor: "rgba(31, 41, 55, 0.6)",
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  emoji: {
    fontSize: "1.25rem",
  },
  moodText: {
    fontWeight: 500,
  },
  noteText: {
    fontSize: "0.875rem",
    color: "#9ca3af",
  },
  dateText: {
    fontSize: "0.75rem",
    color: "#6b7280",
  },
};
