import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import SummaryCards from "./SummaryCards";
import CategoryBudgets from "./CategoryBudgets";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const API = process.env.REACT_APP_API_URL;


const MONTH_LABELS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

/* ---------------- HELPERS ---------------- */

const sum = (arr) => arr.reduce((s, i) => s + Number(i.amount), 0);

const getBudgetHealthScore = (spent, budget) => {
  if (!budget) return { label: "No budgets set", color: "gray" };
  const p = (spent / budget) * 100;
  if (p <= 80) return { label: "Healthy", color: "green" };
  if (p <= 100) return { label: "Warning", color: "orange" };
  return { label: "Over Budget", color: "red" };
};

const getNumericBudgetHealthScore = (spent, budget) => {
  if (!budget) return 0;
  return Math.max(0, Math.min(100, Math.round(100 - (spent / budget) * 100)));
};

const getAIRecommendations = (expenses) => {
  if (!expenses.length) return ["Add expenses to receive insights."];
  const total = sum(expenses);
  const byCat = {};
  expenses.forEach(e => {
    const c = e.category || "Uncategorized";
    byCat[c] = (byCat[c] || 0) + Number(e.amount);
  });

  const recs = [];
  const [topCat, topAmt] = Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0];
  if ((topAmt / total) * 100 > 50) {
    recs.push(`More than 50% of spending is in ${topCat}.`);
  }
  if (expenses.filter(e => e.amount < 10).length >= 5) {
    recs.push("Many small transactions detected.");
  }
  if (!recs.length) recs.push("Spending pattern looks stable.");
  return recs;
};

const getBudgetBasedAIRecommendations = (expenses, budgets) => {
  if (!budgets.length) return [];
  const spent = {};
  expenses.forEach(e => {
    const c = e.category || "Uncategorized";
    spent[c] = (spent[c] || 0) + Number(e.amount);
  });

  const recs = [];
  budgets.forEach(b => {
    const used = spent[b.category] || 0;
    const pct = Math.round((used / b.amount) * 100);
    if (pct > 100) {
      recs.push(`Over ${b.category} budget by ${pct - 100}%.`);
    } else if (pct >= 90) {
      recs.push(`Used ${pct}% of ${b.category} budget.`);
    }
  });
  return recs;
};

/* ---------------- COMPONENT ---------------- */

function Dashboard() {
  const [incomeData, setIncome] = useState([]);
  const [expenseData, setExpenses] = useState([]);
  const [savingsData, setSavings] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [selectedYear] = useState("2026");
  const [selectedMonth] = useState("all");

  useEffect(() => {
    fetchAll();
    fetchBudgets();
  }, []);

  const fetchAll = async () => {
    const [i,e,s] = await Promise.all([
      axios.get(`${API}/income`),
      axios.get(`${API}/expenses`),
      axios.get(`${API}/savings`)
    ]);
    setIncome(i.data);
    setExpenses(e.data);
    setSavings(s.data);
  };

  const fetchBudgets = async () => {
    try {
      const res = await axios.get(`${API}/budgets`);
      setBudgets(res.data);
    } catch {
      setBudgets([]);
    }
  };

  const filter = (data) =>
    data.filter(d =>
      new Date(d.date).getFullYear().toString() === selectedYear
    );

  const income = filter(incomeData);
  const expenses = filter(expenseData);
  const savings = filter(savingsData);

  const totals = {
    income: sum(income),
    expenses: sum(expenses),
    savings: sum(savings),
  };

  const netBalance = totals.income - totals.expenses;

  const monthlyExpenses = MONTH_LABELS.map((_, i) =>
    expenses
      .filter(e => new Date(e.date).getMonth() === i)
      .reduce((s,e)=>s+Number(e.amount),0)
  );

  const totalBudget = budgets.reduce((s,b)=>s+Number(b.amount),0);
  const health = getBudgetHealthScore(totals.expenses, totalBudget);
  const numericHealth = getNumericBudgetHealthScore(totals.expenses, totalBudget);

  const aiRecs = useMemo(() => [
    ...getAIRecommendations(expenses),
    ...getBudgetBasedAIRecommendations(expenses, budgets)
  ], [expenses, budgets]);

  return (
    <div style={{ padding: 2 }}>
      <h2>Dashboard</h2>

      <SummaryCards {...totals} year={selectedYear} month="All Months" />

      <p><strong>Net Balance:</strong> ${netBalance.toFixed(2)}</p>

      <h3>Budget Health</h3>
      <p style={{ color: health.color }}>{health.label}</p>
      <p>Score: {numericHealth}/100</p>

      <Pie
  data={{
    labels: ["Income", "Expenses", "Savings"],
    datasets: [
      {
        data: [totals.income, totals.expenses, totals.savings],
        backgroundColor: ["#0088FE", "#fa1111", "#00C49F"],
        borderWidth: 1,
      },
    ],
  }}
/>



      <CategoryBudgets
        expenses={expenses}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
      />

      <h3>Smart Recommendations</h3>
      <ul>
        {aiRecs.map((r,i)=><li key={i}>{r}</li>)}
      </ul>
    </div>
  );
}

export default Dashboard;
