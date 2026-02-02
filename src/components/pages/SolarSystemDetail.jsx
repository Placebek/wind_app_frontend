// src/pages/Solar/SolarSystemDetailPage.jsx

import { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "https://energy-app.space/api/api/v1";

export default function SolarSystemDetailPage() {
  const { id } = useParams();
  const [system, setSystem] = useState(null);
  const [measurements, setMeasurements] = useState([]); // solar_data
  const [forecasts, setForecasts] = useState([]);       // solar_forecasts
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Форма и логика панелей (оставляем как было)
  // ... (ваш код с панелями)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [systemRes, measurementsRes, forecastsRes, panelsRes] = await Promise.all([
          axios.get(`${API_BASE}/solar/solar_system/${id}`),
          axios.get(`${API_BASE}/solar_data/`, { params: { system_id: id, limit: 168 } }), // последние 7 дней
          axios.get(`${API_BASE}/solar/solar_system/solar_forecasts/`, { params: { system_id: id } }),        // прогнозы
          axios.get(`${API_BASE}/solar_panels/`, { params: { system_id: id } }),
        ]);
        setSystem(systemRes.data);
        setMeasurements(measurementsRes.data || []);
        setForecasts(forecastsRes.data || []);
        setPanels(panelsRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить данные системы");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Расчёт активной мощности панелей
  const totalActivePower = panels
    .filter((p) => p.status === "Активна")
    .reduce((sum, p) => sum + parseFloat(p.power || 0), 0)
    .toFixed(2);

  // Данные для графиков (последние 24 часа + прогноз)
  const chartData = [
    // Фактические измерения (последние 24 записи)
    ...measurements
      .slice(-24)
      .map((m) => ({
        time: new Date(m.created_at).toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        actual_power: m.ac_power ? (m.ac_power / 1000).toFixed(2) : 0, // в кВт
        irradiance: m.ghi || m.poa_global || 0, // используем GHI или POA
      })),
    // Прогнозы (следующие 24 часа)
    ...forecasts
      .sort((a, b) => new Date(a.target_time || a.timestamp) - new Date(b.target_time || b.timestamp))
      .slice(0, 24)
      .map((f) => ({
        time: new Date(f.target_time || f.timestamp).toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        forecast_power: f.predicted_power ? (f.predicted_power / 1000).toFixed(2) : 0,
      })),
  ];

  if (loading) return <p className="text-center py-12 text-gray-600">Загрузка данных...</p>;
  if (error) return <p className="text-center text-red-600 py-12">{error}</p>;
  if (!system) return <p className="text-center text-red-600 py-12">Система не найдена</p>;

  return (
    <div className="space-y-8">
      <NavLink
        to="/solar"
        className="flex items-center text-yellow-600 hover:text-yellow-700 font-medium"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Назад к списку систем
      </NavLink>

      {/* Информация о системе */}
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{system.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-lg mb-8">
          <div>
            <span className="text-gray-600">Номинальная мощность:</span>
            <p className="font-bold text-yellow-600">{system.power_kw || 0} кВт</p>
          </div>
          <div>
            <span className="text-gray-600">КПД:</span>
            <p className="font-bold">{system.efficiency || "-"} %</p>
          </div>
          <div>
            <span className="text-gray-600">Статус:</span>
            <p className="font-bold text-green-600">{system.status || "Активна"}</p>
          </div>
          <div>
            <span className="text-gray-600">Активные панели:</span>
            <p className="font-bold text-yellow-600">{totalActivePower} кВт</p>
          </div>
        </div>
      </div>

      {/* График генерации и прогноза */}
      {(measurements.length > 0 || forecasts.length > 0) && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Генерация и прогноз мощности (последние 24 ч + прогноз)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis label={{ value: "Мощность (кВт)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual_power"
                stroke="#f59e0b"
                name="Фактическая мощность"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="forecast_power"
                stroke="#3b82f6"
                name="Прогноз мощности"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Дополнительный график иррадиации */}
          {measurements.some(m => m.ghi || m.poa_global) && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Иррадиация (GHI / POA)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.filter(d => d.irradiance !== undefined)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis label={{ value: "Иррадиация (Вт/м²)", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="irradiance"
                    stroke="#10b981"
                    name="Иррадиация"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Панели (ваш существующий код с формой и таблицей/карточками) */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Солнечные панели</h2>
        {/* Ваш код с панелями */}
      </div>

      {/* Последние измерения (опционально) */}
      {measurements.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <h2 className="text-xl font-semibold px-6 pt-6 mb-4">Последние измерения</h2>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4">Время</th>
                <th className="p-4">AC мощность (кВт)</th>
                <th className="p-4">GHI (Вт/м²)</th>
                <th className="p-4">Темп. воздуха (°C)</th>
              </tr>
            </thead>
            <tbody>
              {measurements.slice(-10).reverse().map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{new Date(m.created_at).toLocaleString("ru-RU")}</td>
                  <td className="p-4">{m.ac_power ? (m.ac_power / 1000).toFixed(2) : "0.00"}</td>
                  <td className="p-4">{m.ghi?.toFixed(0) || "-"}</td>
                  <td className="p-4">{m.temp_air?.toFixed(1) || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}