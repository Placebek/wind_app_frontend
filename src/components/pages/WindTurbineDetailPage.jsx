// src/pages/Wind/WindTurbineDetailPage.jsx

import { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const API_BASE = "https://energy-app.space/api/api/v1/wind";

export default function WindTurbineDetailPage() {
  const { id } = useParams();
  const [turbine, setTurbine] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [turbineRes, measurementsRes, forecastsRes] = await Promise.all([
          axios.get(`${API_BASE}/wind_turbines/${id}`),
          axios.get(`${API_BASE}/wind_data/`, { params: { wind_turbine_id: id, limit: 168 } }), // последние 7 дней (по часам)
          axios.get(`${API_BASE}/wind_forecasts/`, { params: { turbine_id: id } }),
        ]);
        setTurbine(turbineRes.data);
        setMeasurements(measurementsRes.data || []);
        setForecasts(forecastsRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить данные турбины");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Подготовка данных для графика (последние измерения + прогнозы)
  const chartData = [
    // Измерения (реальные)
    ...measurements
      .slice(-24) // последние 24 часа, например
      .map(m => ({
        time: new Date(m.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        actual_power: m.power_ac_W / 1000, // в кВт
        wind_speed: m.wind_speed,
      })),
    // Прогнозы
    ...forecasts
      .sort((a, b) => new Date(a.target_time) - new Date(b.target_time))
      .slice(0, 24)
      .map(f => ({
        time: new Date(f.target_time).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        forecast_power: f.wind_power_kw_forecast,
        wind_speed_forecast: f.wind_speed_forecast,
      })),
  ];

  if (loading) return <p className="text-center py-12 text-gray-600">Загрузка данных турбины...</p>;
  if (error) return <p className="text-center text-red-600 py-12">{error}</p>;
  if (!turbine) return <p className="text-center text-red-600 py-12">Турбина не найдена</p>;

  const isActive = turbine.status === "Активна";
  const displayPower = isActive ? turbine.power : 0;

  return (
    <div className="space-y-8">
      {/* Кнопка назад */}
      <NavLink
        to="/wind"
        className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Назад к списку турбин
      </NavLink>

      {/* Основная информация о турбине */}
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{turbine.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-lg mb-8">
          <div>
            <span className="text-gray-600">Номинальная мощность:</span>
            <p className="font-bold text-blue-600">{turbine.power} кВт</p>
          </div>
          <div>
            <span className="text-gray-600">Текущая мощность (активная):</span>
            <p className="font-bold text-blue-600">{displayPower} кВт</p>
          </div>
          <div>
            <span className="text-gray-600">Локация:</span>
            <p className="font-bold">{turbine.location || "Не указана"}</p>
          </div>
          <div>
            <span className="text-gray-600">Статус:</span>
            <p className={`font-bold ${isActive ? "text-green-600" : "text-red-600"}`}>
              {turbine.status}
            </p>
          </div>
        </div>

        <div className="pt-8 border-t">
          <p className="text-sm text-gray-500">
            Добавлена: {new Date(turbine.created_at).toLocaleDateString("ru-RU")}
          </p>
        </div>
      </div>

      {/* График генерации и прогноза */}
      {(measurements.length > 0 || forecasts.length > 0) && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Генерация и прогноз мощности (последние 24 часа + прогноз)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis label={{ value: "Мощность (кВт)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="actual_power" stroke="#2563eb" name="Фактическая мощность" strokeWidth={2} />
              <Line type="monotone" dataKey="forecast_power" stroke="#f59e0b" name="Прогноз мощности" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis label={{ value: "Скорость ветра (м/с)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="wind_speed" stroke="#10b981" name="Фактическая скорость ветра" />
                <Line type="monotone" dataKey="wind_speed_forecast" stroke="#f97316" name="Прогноз скорости ветра" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Последние измерения */}
      {measurements.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <h2 className="text-xl font-semibold px-6 pt-6 mb-4">
            Последние измерения (Wind Data)
          </h2>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4">Время</th>
                <th className="p-4">Скорость ветра (м/с)</th>
                <th className="p-4">Мощность AC (кВт)</th>
                <th className="p-4">Плотность воздуха</th>
              </tr>
            </thead>
            <tbody>
              {measurements.slice(-10).reverse().map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{new Date(m.created_at).toLocaleString("ru-RU")}</td>
                  <td className="p-4">{m.wind_speed.toFixed(2)}</td>
                  <td className="p-4">{(m.power_ac_W / 1000).toFixed(2)}</td>
                  <td className="p-4">{m.rho.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Прогнозы */}
      {forecasts.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <h2 className="text-xl font-semibold px-6 pt-6 mb-4">
            Прогнозы генерации
          </h2>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4">Время прогноза</th>
                <th className="p-4">Прогноз скорости ветра (м/с)</th>
                <th className="p-4">Прогноз мощности (кВт)</th>
              </tr>
            </thead>
            <tbody>
              {forecasts.slice(0, 10).map((f) => (
                <tr key={f.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{new Date(f.target_time).toLocaleString("ru-RU")}</td>
                  <td className="p-4">{f.wind_speed_forecast?.toFixed(2) || "-"}</td>
                  <td className="p-4">{f.wind_power_kw_forecast?.toFixed(2) || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}