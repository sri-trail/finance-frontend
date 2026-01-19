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


const MONTH_LABELS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

function ExpensesDashboard() {
  const [expensesData, setExpensesData] = useState([]);
  const [editItem, setEditItem] = useState(null);

  const [form, setForm] = useState({
    source: "",
    category: "",
    amount: "",
    date: "",
  });

  // selectors
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("all");

  // ✅ SIMPLE CATEGORY BUDGETS (local only)
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [budgetForm, setBudgetForm] = useState({
    category: "",
    budget: "",
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API}/expenses`);
      setExpensesData(res.data);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axios.put(`${API}/expenses/${editItem.id}`, form);
        setEditItem(null);
      } else {
        await axios.post(`${API}/expenses`, form);
      }
      setForm({ source: "", category: "", amount: "", date: "" });
      fetchExpenses();
    } catch (err) {
      console.error("Failed to save expense:", err);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      source: item.source,
      category: item.category || "",
      amount: item.amount,
      date: item.date,
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error("Failed to delete expense:", err);
    }
  };

  // -------------------------
  // Filtering
  // -------------------------
  const expensesFiltered = useMemo(() => {
    return expensesData.filter((e) => {
      const d = new Date(e.date);
      const yearMatch = d.getFullYear().toString() === selectedYear;
      const monthMatch =
        selectedMonth === "all" ||
        d.getMonth().toString() === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [expensesData, selectedYear, selectedMonth]);

  const hasData = expensesFiltered.length > 0;

  // -------------------------
  // Monthly totals
  // -------------------------
  const monthlyTotals = useMemo(() => {
    return MONTH_LABELS.map((label, index) => {
      const total = expensesData
        .filter((e) => {
          const d = new Date(e.date);
          return (
            d.getFullYear().toString() === selectedYear &&
            d.getMonth() === index
          );
        })
        .reduce((s, e) => s + Number(e.amount), 0);
      return { label, total };
    });
  }, [expensesData, selectedYear]);

  const highestMonth = useMemo(() => {
    if (!monthlyTotals.length) return null;
    return monthlyTotals.reduce((max, cur) =>
      cur.total > max.total ? cur : max
    );
  }, [monthlyTotals]);

  // -------------------------
  // Category totals
  // -------------------------
  const categoryTotals = useMemo(() => {
    const map = {};
    expensesFiltered.forEach((e) => {
      const cat = e.category || "Uncategorized";
      map[cat] = (map[cat] || 0) + Number(e.amount);
    });
    return Object.entries(map);
  }, [expensesFiltered]);

  // -------------------------
  // Budget handlers
  // -------------------------
  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    setCategoryBudgets({
      ...categoryBudgets,
      [budgetForm.category]: Number(budgetForm.budget),
    });
    setBudgetForm({ category: "", budget: "" });
  };

  const barData = {
    labels: monthlyTotals.map((m) => m.label),
    datasets: [
      {
        label: "Expenses",
        data: monthlyTotals.map((m) => m.total),
        backgroundColor: monthlyTotals.map((m) =>
          m.label === highestMonth?.label ? "#D32F2F" : "#FF8042"
        ),
      },
    ],
  };

  const totalExpenses = expensesFiltered.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>Expenses Dashboard</h2>

      {/* YEAR + MONTH SELECTORS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div>
          <label>Year: </label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>

        <div>
          <label>Month: </label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            <option value="all">All Months</option>
            {MONTH_LABELS.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* EXPENSE FORM */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input name="source" placeholder="Source" value={form.source} onChange={handleChange} required />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} required />
        <input name="date" type="date" value={form.date} onChange={handleChange} required />
        <button type="submit">{editItem ? "Update" : "Add"}</button>
      </form>

      {!hasData && <p style={{ color: "gray" }}>No expenses for selected year/month.</p>}

      {hasData && (
        <>
          <p><strong>Total Expenses:</strong> ${totalExpenses.toFixed(2)}</p>

          <div style={{ maxWidth: 800, marginBottom: "30px" }}>
            <Bar data={barData} />
          </div>

          {/* CATEGORY BUDGETS */}
          <h3>Category Budgets (Simple)</h3>

          <form onSubmit={handleBudgetSubmit} style={{ marginBottom: "20px" }}>
            <input
              placeholder="Category"
              value={budgetForm.category}
              onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Budget"
              value={budgetForm.budget}
              onChange={(e) => setBudgetForm({ ...budgetForm, budget: e.target.value })}
              required
            />
            <button type="submit">Set Budget</button>
          </form>

          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Category</th>
                <th>Spent</th>
                <th>Budget</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {categoryTotals.map(([cat, spent]) => {
                const budget = categoryBudgets[cat] || 0;
                const remaining = budget - spent;
                return (
                  <tr key={cat}>
                    <td>{cat}</td>
                    <td>${spent.toFixed(2)}</td>
                    <td>${budget.toFixed(2)}</td>
                    <td style={{ color: remaining < 0 ? "red" : "green" }}>
                      ${remaining.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default ExpensesDashboard;
