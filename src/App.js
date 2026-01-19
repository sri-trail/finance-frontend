import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Income from "./components/Income";
import Expenses from "./components/Expenses";
import Savings from "./components/Savings";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Router>
      <div>
        <h1>Personal Finance Tracker</h1>
        <nav>
          <Link to="/dashboard">Dashboard</Link> |{" "}
          <Link to="/income">Income</Link> |{" "}
          <Link to="/expenses">Expenses</Link> |{" "}
          <Link to="/savings">Savings</Link>
        </nav>

        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="*" element={<Dashboard />} /> {/* default */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
