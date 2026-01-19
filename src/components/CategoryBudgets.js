import React, { useState } from "react";
import axios from "axios";

const CATEGORIES = [
  "Food",
  "Rent",
  "Transport",
  "Utilities",
  "Entertainment",
  "Other",
];

function CategoryBudgets({ expenses, selectedMonth }) {
  const [budgets, setBudgets] = useState({});

  const handleBudgetChange = (category, value) => {
    setBudgets({
      ...budgets,
      [category]: Number(value),
    });
  };
const API = process.env.REACT_APP_API_URL;


React.useEffect(() => {
  axios.get(`${API}/budgets`).then((res) => {
    const map = {};
    res.data.forEach((b) => {
      map[b.category] = b.amount;
    });
    setBudgets(map);
  });
}, []);

  // Calculate total spent per category for selected month
  const getCategoryTotal = (category) => {
  return expenses
    .filter((e) => {
      if (e.category !== category) return false;
      if (selectedMonth === "all") return true;
      return e.date.startsWith(selectedMonth);
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);
};


  return (
    <div style={{ marginTop: "30px" }}>
      <h3>Category Budgets ({selectedMonth})</h3>

      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>Category</th>
            <th>Budget</th>
            <th>Spent</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {CATEGORIES.map((cat) => {
            const spent = getCategoryTotal(cat);
            const budget = budgets[cat] || 0;
            const over = budget > 0 && spent > budget;

            return (
              <tr
                key={cat}
                style={{
                  backgroundColor: over ? "#ffe5e5" : "transparent",
                }}
              >
                <td>{cat}</td>

                <td>
                  <input
                    type="number"
                    placeholder="Set budget"
                    value={budget || ""}
                    onChange={(e) =>
                      handleBudgetChange(cat, e.target.value)
                    }
                  />
                </td>

                <td>${spent.toFixed(2)}</td>

                <td>
                  {budget === 0
                    ? "No budget"
                    : over
                    ? "Over budget"
                    : "Within budget"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryBudgets;
