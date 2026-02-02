// src/pages/Wind/WindPage.jsx

import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  XCircleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

const API_BASE = "https://energy-app.space/api/api/v1/wind";

export default function WindPage() {
  const [turbines, setTurbines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Форма
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    power: "",
    location: "",
    status: "Активна",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchTurbines();
  }, []);

  const fetchTurbines = async () => {
    try {
      const response = await axios.get(`${API_BASE}/wind_turbines/`);
      setTurbines(response.data);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить ветрогенераторы");
    } finally {
      setLoading(false);
    }
  };

  const totalActivePower = turbines
    .filter((t) => t.status === "Активна")
    .reduce((sum, t) => sum + parseFloat(t.power || 0), 0)
    .toFixed(2);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Название обязательно";
    if (!formData.power || parseFloat(formData.power) <= 0)
      errors.power = "Мощность должна быть больше 0";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const turbineData = {
      name: formData.name.trim(),
      power: parseFloat(formData.power),
      location: formData.location.trim() || null,
      status: formData.status,
    };

    try {
      if (isEditing && formData.id) {
        const response = await axios.put(
          `${API_BASE}/wind_turbines/${formData.id}`,
          turbineData
        );
        setTurbines((prev) =>
          prev.map((t) => (t.id === formData.id ? response.data : t))
        );
      } else {
        const response = await axios.post(`${API_BASE}/wind_turbines/`, turbineData);
        setTurbines((prev) => [...prev, response.data]);
      }
      resetForm();
      setIsEditing(false);
    } catch (err) {
      alert("Ошибка при сохранении турбины");
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      power: "",
      location: "",
      status: "Активна",
    });
    setFormErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    resetForm();
  };

  const handleEdit = (turbine) => {
    setFormData({
      id: turbine.id,
      name: turbine.name,
      power: turbine.power.toString(),
      location: turbine.location || "",
      status: turbine.status,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту турбину? Все связанные данные будут удалены!"))
      return;

    try {
      await axios.delete(`${API_BASE}/wind_turbines/${id}`);
      setTurbines((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert("Ошибка при удалении турбины");
      console.error(err);
    }
  };

  if (loading) return <p className="text-center py-12 text-gray-600">Загрузка ветрогенераторов...</p>;
  if (error) return <p className="text-center text-red-600 py-12">{error}</p>;

  return (
    <div className="space-y-8">
      {/* Заголовок и общая мощность */}
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Управление Ветрогенераторами
        </h1>
        <p className="text-gray-600 mb-6">
          Добавление, редактирование и мониторинг ветряных турбин вашей системы.
        </p>
        <div className="text-2xl font-medium text-gray-700">
          Общая мощность активных турбин:{" "}
          <span className="text-blue-600 font-bold">{totalActivePower} кВт</span>
        </div>
      </div>

      {/* Форма добавления/редактирования */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-6">
          {isEditing ? "Редактировать турбину" : "Добавить новую турбину"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Название турбины
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 ${
                formErrors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Vestas V150"
            />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Мощность (кВт)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.power}
              onChange={(e) => setFormData({ ...formData, power: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 ${
                formErrors.power ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="4500"
            />
            {formErrors.power && <p className="text-red-500 text-xs mt-1">{formErrors.power}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Локация
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
              placeholder="Оффшор Балтика"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Статус
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            >
              <option>Активна</option>
              <option>Неактивна</option>
              <option>На обслуживании</option>
            </select>
          </div>

          <div className="md:col-span-4 flex justify-end gap-3">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg shadow"
              >
                <XCircleIcon className="h-5 w-5 mr-2" />
                Отмена
              </button>
            )}
            <button
              type="submit"
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              {isEditing ? "Сохранить изменения" : "Добавить турбину"}
            </button>
          </div>
        </form>
      </div>

      {/* Список турбин — КАРТОЧКИ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turbines.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500 mb-4">
              Нет добавленных ветрогенераторов
            </p>
            <p className="text-sm text-gray-400">
              Добавьте первую турбину с помощью формы выше ↑
            </p>
          </div>
        ) : (
          turbines.map((turbine) => (
            <NavLink
              key={turbine.id}
              to={`/wind/${turbine.id}`}
              className="block bg-white rounded-xl shadow hover:shadow-xl transition-transform hover:-translate-y-1 border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {turbine.name}
                </h3>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Мощность:</span>
                  <span className="font-bold text-blue-600">{turbine.power} кВт</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Локация:</span>
                  <span className="font-medium">{turbine.location || "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Статус:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      turbine.status === "Активна"
                        ? "bg-green-100 text-green-800"
                        : turbine.status === "Неактивна"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {turbine.status}
                  </span>
                </div>
              </div>

              {/* Кнопки действий внизу карточки */}
              <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEdit(turbine);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                  title="Редактировать"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(turbine.id);
                  }}
                  className="text-red-600 hover:text-red-800"
                  title="Удалить"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </NavLink>
          ))
        )}
      </div>
    </div>
  );
}