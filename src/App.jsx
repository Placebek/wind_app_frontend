import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import DataPage from "./components/pages/DataPage";
import SolarPage from "./components/pages/SolarPage";
import WindPage from "./components/pages/WindPage";
import SettingsPage from "./components/pages/SettingsPage";
import './App.css'
import SolarSimulationPage from "./components/pages/SolarSimulationPage";
import SolarSystemDetailPage from "./components/pages/SolarSystemDetail";
import WindTurbineDetailPage from "./components/pages/WindTurbineDetailPage";

function App() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/solar" element={<SolarPage />} />
          <Route path="/solar/:id" element={<SolarSystemDetailPage />} />
          <Route path="/wind" element={<WindPage />} />
          <Route path="/wind/:id" element={<WindTurbineDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/solar/simulation" element={<SolarSimulationPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
