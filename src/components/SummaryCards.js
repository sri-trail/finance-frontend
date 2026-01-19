import React from "react";

function SummaryCards({ income, expenses, savings, year, month }) {
  const cardStyle = {
    flex: 1,
    padding: "20px",
    borderRadius: "10px",
    color: "#fff",
    minWidth: "200px",
  };

  return (
    <div>
      <h3>
        Summary — {month}, {year}
      </h3>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ ...cardStyle, background: "#0088FE" }}>
          <h4>Total Income</h4>
          <p>${income.toFixed(2)}</p>
        </div>

        <div style={{ ...cardStyle, background: "#FF8042" }}>
          <h4>Total Expenses</h4>
          <p>${expenses.toFixed(2)}</p>
        </div>

        <div style={{ ...cardStyle, background: "#00C49F" }}>
          <h4>Total Savings</h4>
          <p>${savings.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;
