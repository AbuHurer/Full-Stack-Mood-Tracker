import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function App() {
  const [mood, setMood] = useState('');
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState([]);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const fetchEntries = async () => {
    const res = await axios.get(`${API_BASE}/moods`);
    setEntries(res.data);
  };

  const addEntry = async () => {
    await axios.post(`${API_BASE}/moods`, { mood, note });
    setMood('');
    setNote('');
    fetchEntries();
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Mood Tracker</h1>
      <div className="flex gap-2 mb-4">
        <select
          className="border rounded p-2"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        >
          <option value="">Select mood</option>
          <option value="Happy">Happy</option>
          <option value="Sad">Sad</option>
          <option value="Neutral">Neutral</option>
        </select>
        <input
          className="border rounded p-2 flex-1"
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={addEntry}
        >
          Add
        </button>
      </div>
      <ul className="mb-8">
        {entries.map((e, i) => (
          <li key={i} className="border-b py-2">
            <strong>{e.mood}</strong> - {e.note}
          </li>
        ))}
      </ul>
      <Line
        data={{
          labels: entries.map((e) => new Date(e.date).toLocaleDateString()),
          datasets: [
            {
              label: 'Mood over time',
              data: entries.map((e) =>
                e.mood === 'Happy' ? 3 : e.mood === 'Neutral' ? 2 : 1
              ),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        }}
      />
    </div>
  );
}
