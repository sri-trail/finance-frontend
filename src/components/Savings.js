import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const API = process.env.REACT_APP_API_URL;


function SavingsDashboard() {
  const [savingsData, setSavingsData] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ source: "", amount: "", date: "" });

  // ✅ sorting state
  const [sortBy, setSortBy] = useState("date_desc");

  useEffect(() => {
    fetchSavings();
  }, []);

  const fetchSavings = async () => {
    try {
      const res = await axios.get(`${API}/savings`);
      setSavingsData(res.data);
    } catch (err) {
      console.error("Failed to fetch savings:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axios.put(`${API}/savings/${editItem.id}`, form);
        setEditItem(null);
      } else {
        await axios.post(`${API}/savings`, form);
      }
      setForm({ source: "", amount: "", date: "" });
      fetchSavings();
    } catch (err) {
      console.error("Failed to save saving:", err);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({ source: item.source, amount: item.amount, date: item.date });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/savings/${id}`);
      fetchSavings();
    } catch (err) {
      console.error("Failed to delete saving:", err);
    }
  };

  // ---------------------------
  // Monthly chart (unchanged)
  // ---------------------------
  const getMonthlyData = () => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map((month) =>
      savingsData
        .filter((item) => new Date(item.date).getMonth() + 1 === month)
        .reduce((acc, item) => acc + Number(item.amount), 0)
    );
  };

  const barData = {
    labels: [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ],
    datasets: [
      {
        label: "Savings",
        data: getMonthlyData(),
        backgroundColor: "#00C49F",
      },
    ],
  };

  const totalSavings = savingsData.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  // ---------------------------
  // ✅ SORTED TABLE DATA
  // ---------------------------
  const sortedSavings = useMemo(() => {
    const data = [...savingsData];

    switch (sortBy) {
      case "date_asc":
        return data.sort((a, b) => new Date(a.date) - new Date(b.date));
      case "date_desc":
        return data.sort((a, b) => new Date(b.date) - new Date(a.date));
      case "amount_asc":
        return data.sort((a, b) => Number(a.amount) - Number(b.amount));
      case "amount_desc":
        return data.sort((a, b) => Number(b.amount) - Number(a.amount));
      case "source_asc":
        return data.sort((a, b) => a.source.localeCompare(b.source));
      case "source_desc":
        return data.sort((a, b) => b.source.localeCompare(a.source));
      default:
        return data;
    }
  }, [savingsData, sortBy]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Savings Dashboard</h2>

      {/* Add / Edit Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          name="source"
          placeholder="Source"
          value={form.source}
          onChange={handleChange}
          required
        />
        <input
          name="amount"
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <button type="submit">{editItem ? "Update" : "Add"}</button>
        {editItem && (
          <button
            type="button"
            onClick={() => {
              setEditItem(null);
              setForm({ source: "", amount: "", date: "" });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <p><strong>Total Savings:</strong> ${totalSavings.toFixed(2)}</p>

      {/* Chart */}
      <div style={{ width: "100%", maxWidth: 800, marginBottom: "30px" }}>
        <Bar data={barData} />
      </div>

      {/* ✅ SORT CONTROLS */}
      <div style={{ marginBottom: "10px" }}>
        <label>Sort by: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date_desc">Date (Newest first)</option>
          <option value="date_asc">Date (Oldest first)</option>
          <option value="amount_desc">Amount (High → Low)</option>
          <option value="amount_asc">Amount (Low → High)</option>
          <option value="source_asc">Source (A → Z)</option>
          <option value="source_desc">Source (Z → A)</option>
        </select>
      </div>

      {/* Table */}
      <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Source</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedSavings.map((item) => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td>{item.source}</td>
              <td>${item.amount}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SavingsDashboard;
