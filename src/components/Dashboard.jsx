// src/pages/Dashboard.jsx

import { useState, useEffect } from "react";
import {
  SunIcon,
  CloudIcon,
  BoltIcon,
  Battery100Icon,
  Battery50Icon,
  Battery0Icon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
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
  Area,
  AreaChart,
  ComposedChart,
  Bar,
} from "recharts";

const API_BASE = "http://localhost:8000/api/v1";

export default function Dashboard() {
  const [stats, setStats] = useState({
    solar: 5.2,
    wind: 3.8,
    load: 7.1,
    soc: 0.72,
  });

  const [events, setEvents] = useState([
    { time: "14:15", message: "PPO-агент: Начата зарядка батареи (+4.2 кВт)", type: "charge" },
    { time: "13:50", message: "Увеличение солнечной генерации до 6.1 кВт", type: "solar" },
    { time: "13:20", message: "Нагрузка выросла до 8.3 кВт — разряд батареи", type: "discharge" },
    { time: "12:45", message: "Ветер: 4.8 кВт (стабильно)", type: "wind" },
    { time: "12:00", message: "Система в балансе. SOC: 78%", type: "info" },
  ]);

  // Данные для графиков
  const [solarData, setSolarData] = useState([]);
  const [windData, setWindData] = useState([]);
  const [activeTab, setActiveTab] = useState("solar"); // solar | wind | balance

  // Моковые обновления статистики и событий
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        solar: Number((Math.random() * 7 + 1).toFixed(2)),
        wind: Number((Math.random() * 6 + 1).toFixed(2)),
        load: Number((6 + Math.random() * 4).toFixed(2)),
        soc: Number(Math.max(0.1, Math.min(0.95, prev.soc + (Math.random() - 0.5) * 0.08)).toFixed(2)),
      }));

      if (Math.random() > 0.7) {
        const types = ["charge", "discharge", "solar", "wind", "info"];
        const type = types[Math.floor(Math.random() * types.length)];
        const messages = {
          charge: "PPO-агент: Зарядка батареи",
          discharge: "PPO-агент: Разрядка батареи (высокая нагрузка)",
          solar: "Изменение солнечной генерации",
          wind: "Изменение ветровой генерации",
          info: "Система в стабильном состоянии",
        };
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        setEvents((prev) => [{ time, message: messages[type], type }, ...prev.slice(0, 9)]);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Загрузка реальных данных для графиков (один раз при монтировании)
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        // Предполагаем, что у вас есть хотя бы одна система и одна турбина
        const [solarRes, windRes] = await Promise.all([
          axios.get(`${API_BASE}/solar_data/?limit=48`), // последние 48 часов
          axios.get(`${API_BASE}/wind/wind_data/?limit=48`),
        ]);

        // Форматируем данные для графика
        const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

        setSolarData(
          solarRes.data.map((d) => ({
            time: formatTime(d.created_at),
            power: d.ac_power ? (d.ac_power / 1000).toFixed(2) : 0,
            irradiance: d.ghi || d.poa_global || 0,
          }))
        );

        setWindData(
          windRes.data.map((d) => ({
            time: formatTime(d.created_at),
            power: (d.power_ac_W / 1000).toFixed(2),
            wind_speed: d.wind_speed.toFixed(1),
          }))
        );
      } catch (err) {
        console.error("Не удалось загрузить данные для графиков", err);
        // Можно оставить пустые массивы — график просто не покажет данные
      }
    };

    fetchGraphData();
  }, []);

  const totalGeneration = stats.solar + stats.wind;
  const balance = totalGeneration - stats.load;
  const balanceText = balance > 0 ? "Избыток" : "Дефицит";
  const balanceColor = balance > 0 ? "text-green-600" : "text-red-600";

  const getBatteryIcon = (soc) => {
    if (soc > 0.7) return Battery100Icon;
    if (soc > 0.3) return Battery50Icon;
    return Battery0Icon;
  };
  const BatteryIcon = getBatteryIcon(stats.soc);

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Панель управления микросетью</h1>
        <p className="text-gray-500 mt-2">
          Мониторинг в реальном времени • {new Date().toLocaleDateString("ru-RU", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={SunIcon} color="yellow" title="Солнечная генерация" value={`${stats.solar} кВт`} trend={stats.solar > 4 ? "up" : "down"} />
        <StatCard icon={CloudIcon} color="blue" title="Ветровая генерация" value={`${stats.wind} кВт`} trend={stats.wind > 3 ? "up" : "down"} />
        <StatCard icon={BoltIcon} color="orange" title="Текущая нагрузка" value={`${stats.load} кВт`} />
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-full">
              <BatteryIcon className={`h-10 w-10 ${stats.soc > 0.3 ? "text-green-700" : "text-red-700"}`} />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Заряд батареи</p>
              <p className={`text-2xl font-bold ${stats.soc > 0.3 ? "text-green-700" : "text-red-700"}`}>
                {(stats.soc * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ${
                  stats.soc > 0.7 ? "bg-green-500" : stats.soc > 0.3 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${stats.soc * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Баланс */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Текущий энергетический баланс</h2>
        <div className="flex items-center justify-around text-center">
          <div>
            <p className="text-sm text-gray-500">Генерация</p>
            <p className="text-2xl font-bold text-blue-600">{totalGeneration.toFixed(2)} кВт</p>
          </div>
          <div className="text-3xl font-bold">{balance > 0 ? "→" : "←"}</div>
          <div>
            <p className="text-sm text-gray-500">Потребление</p>
            <p className="text-2xl font-bold text-orange-600">{stats.load.toFixed(2)} кВт</p>
          </div>
          <div className={`text-2xl font-bold ${balanceColor}`}>
            {balanceText}: {Math.abs(balance).toFixed(2)} кВт
          </div>
        </div>
      </div>

      {/* График с вкладками */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("solar")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === "solar"
                ? "border-yellow-500 text-yellow-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Солнечная генерация
          </button>
          <button
            onClick={() => setActiveTab("wind")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === "wind"
                ? "border-blue-500 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Ветровая генерация
          </button>
          <button
            onClick={() => setActiveTab("balance")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === "balance"
                ? "border-purple-500 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Баланс и батарея
          </button>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === "solar" && (
              <LineChart data={solarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="power" label={{ value: "Мощность (кВт)", angle: -90, position: "insideLeft" }} />
                <YAxis yAxisId="irradiance" orientation="right" label={{ value: "Иррадиация (Вт/м²)", angle: 90, position: "insideRight" }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="power" type="monotone" dataKey="power" stroke="#f59e0b" name="AC мощность" strokeWidth={3} />
                <Line yAxisId="irradiance" type="monotone" dataKey="irradiance" stroke="#10b981" name="Иррадиация" strokeDasharray="5 5" />
              </LineChart>
            )}

            {activeTab === "wind" && (
              <LineChart data={windData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="power" label={{ value: "Мощность (кВт)", angle: -90, position: "insideLeft" }} />
                <YAxis yAxisId="speed" orientation="right" label={{ value: "Скорость ветра (м/с)", angle: 90, position: "insideRight" }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="power" type="monotone" dataKey="power" stroke="#3b82f6" name="Мощность AC" strokeWidth={3} />
                <Line yAxisId="speed" type="monotone" dataKey="wind_speed" stroke="#06b6d4" name="Скорость ветра" strokeDasharray="5 5" />
              </LineChart>
            )}

            {activeTab === "balance" && (
              <ComposedChart data={[] /* можно добавить моковые или реальные данные баланса */}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis label={{ value: "Мощность (кВт)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="generation" stackId="1" stroke="#10b981" fill="#86efac" name="Генерация" />
                <Area type="monotone" dataKey="load" stackId="1" stroke="#f97316" fill="#fb923c" name="Нагрузка" />
                <Line type="monotone" dataKey="battery" stroke="#8b5cf6" name="Заряд батареи (SOC × 10)" strokeWidth={3} />
                <Bar dataKey="balance" fill="#6366f1" name="Баланс" />
              </ComposedChart>
            )}
          </ResponsiveContainer>

          {activeTab === "balance" && (
            <div className="text-center text-gray-500 mt-8">
              <p>Данные баланса и батареи будут здесь (в разработке)</p>
            </div>
          )}
        </div>
      </div>

      {/* События */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ClockIcon className="h-5 w-5" />
          Последние события
        </h2>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {events.map((event, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-xs text-gray-400 mt-1">{event.time}</span>
              <div className="flex-1">
                <p className={`font-medium ${
                  event.type === "charge" ? "text-blue-700" :
                  event.type === "discharge" ? "text-orange-700" :
                  event.type === "solar" ? "text-yellow-700" :
                  event.type === "wind" ? "text-cyan-700" :
                  "text-gray-700"
                }`}>
                  {event.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// StatCard остаётся без изменений
function StatCard({ icon: Icon, color, title, value, trend }) {
  const colorClasses = {
    yellow: "from-yellow-100 to-amber-100 text-yellow-700",
    blue: "from-blue-100 to-cyan-100 text-blue-700",
    orange: "from-orange-100 to-red-100 text-orange-700",
  };
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
      <div className="flex items-center justify-between">
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-4 rounded-full`}>
          <Icon className="h-10 w-10" />
        </div>
        {trend && (
          <div className={trend === "up" ? "text-green-600" : "text-red-600"}>
            {trend === "up" ? <ArrowUpIcon className="h-6 w-6" /> : <ArrowDownIcon className="h-6 w-6" />}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}