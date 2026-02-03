import { Routes, Route } from "react-router-dom";
import Events from "./pages/Events";
import Dashboard from "./pages/Dashboard";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Events />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
