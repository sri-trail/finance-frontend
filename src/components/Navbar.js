import React from "react";

function Navbar({ setView }) {
  return (
    <nav>
      <button onClick={() => setView("income")}>Income</button>
      <button onClick={() => setView("expenses")}>Expenses</button>
      <button onClick={() => setView("savings")}>Savings</button>
    </nav>
  );
}

export default Navbar;
