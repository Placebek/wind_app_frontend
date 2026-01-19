import React, { useEffect, useState } from "react";
import axios from "axios";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";

const API_URL = "http://localhost:8000/api/v1/solar/solar_system";

export default function SolarSimulationPage() {
  const [solarSystems, setSolarSystems] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    timezone: "",
    tilt: "",
    azimuth: "",
    target_kw: "",
    module_power_stc: "",
    albedo: ""
  });
  const [loading, setLoading] = useState(false);

  // --- Загрузка всех систем ---
  const fetchSolarSystems = async () => {
    try {
      const res = await axios.get(API_URL);
      setSolarSystems(res.data);
    } catch (err) {
      console.error("Ошибка загрузки систем:", err);
    }
  };

  useEffect(() => {
    fetchSolarSystems();
  }, []);

  // --- Добавление системы ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(API_URL, {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        tilt: parseFloat(formData.tilt),
        azimuth: parseFloat(formData.azimuth),
        target_kw: parseFloat(formData.target_kw),
        module_power_stc: parseFloat(formData.module_power_stc),
        albedo: parseFloat(formData.albedo)
      });
      setFormData({
        name: "",
        latitude: "",
        longitude: "",
        timezone: "",
        tilt: "",
        azimuth: "",
        target_kw: "",
        module_power_stc: "",
        albedo: ""
      });
      await fetchSolarSystems();
    } catch (err) {
      console.error("Ошибка добавления системы:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Удаление системы ---
  const handleDelete = async (id) => {
    if (!window.confirm("Удалить систему?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setSolarSystems(solarSystems.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Ошибка удаления:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Моделирование солнечной энергии</h1>

      {/* Форма добавления */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl p-6 mb-8 grid grid-cols-3 gap-4"
      >
        <input
          type="text"
          placeholder="Название"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 rounded-lg"
          required
        />
        <input
          type="text"
          placeholder="Широта"
          value={formData.latitude}
          onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
          className="border p-2 rounded-lg"
          required
        />
        <input
          type="text"
          placeholder="Долгота"
          value={formData.longitude}
          onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
          className="border p-2 rounded-lg"
          required
        />
        <input
          type="text"
          placeholder="Часовой пояс"
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
          className="border p-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Угол наклона (tilt)"
          value={formData.tilt}
          onChange={(e) => setFormData({ ...formData, tilt: e.target.value })}
          className="border p-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Азимут"
          value={formData.azimuth}
          onChange={(e) => setFormData({ ...formData, azimuth: e.target.value })}
          className="border p-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Мощность (кВт)"
          value={formData.target_kw}
          onChange={(e) => setFormData({ ...formData, target_kw: e.target.value })}
          className="border p-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Мощность модуля STC"
          value={formData.module_power_stc}
          onChange={(e) => setFormData({ ...formData, module_power_stc: e.target.value })}
          className="border p-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Альбедо"
          value={formData.albedo}
          onChange={(e) => setFormData({ ...formData, albedo: e.target.value })}
          className="border p-2 rounded-lg"
        />

        <button
          type="submit"
          className="col-span-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          disabled={loading}
        >
          <PlusCircleIcon className="w-5 h-5" />
          {loading ? "Добавление..." : "Добавить конфигурацию"}
        </button>
      </form>

      {/* Таблица */}
      <div className="bg-white shadow-md rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-4">Список конфигураций</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Название</th>
              <th className="p-2">Широта</th>
              <th className="p-2">Долгота</th>
              <th className="p-2">Мощность (кВт)</th>
              <th className="p-2">Создано</th>
              <th className="p-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {solarSystems.map((sys) => (
              <tr key={sys.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{sys.name}</td>
                <td className="p-2">{sys.latitude}</td>
                <td className="p-2">{sys.longitude}</td>
                <td className="p-2">{sys.target_kw}</td>
                <td className="p-2">
                  {new Date(sys.created_at).toLocaleString()}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(sys.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {solarSystems.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 p-4">
                  Нет данных
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
