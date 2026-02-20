import { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    batteryCapacity: 50, // кВт·ч
    maxChargePower: 10, // кВт
    maxDischargePower: 15, // кВт
    minSoc: 20, // %
    maxSoc: 95, // %
    gridExportEnabled: true,
    gridImportEnabled: true,
    simulationStep: 60, // минут
    location: "Караганда, Казахстан",
    timezone: "Asia/Almaty",
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleNumberChange = (key, value) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      handleChange(key, num);
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          ⚙ Настройки микросети
        </h1>
        <p className="text-gray-500 text-sm">
          Конфигурация параметров аккумуляторной системы, ограничений и моделирования.
        </p>
      </div>

      {/* Карточка с основными параметрами батареи */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Аккумуляторная система
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Ёмкость батареи (кВт·ч)
            </label>
            <input
              type="number"
              value={settings.batteryCapacity}
              onChange={(e) => handleNumberChange("batteryCapacity", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500"
              min="1"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Макс. мощность зарядки (кВт)
            </label>
            <input
              type="number"
              value={settings.maxChargePower}
              onChange={(e) => handleNumberChange("maxChargePower", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500"
              min="0"
              step="0.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Макс. мощность разрядки (кВт)
            </label>
            <input
              type="number"
              value={settings.maxDischargePower}
              onChange={(e) => handleNumberChange("maxDischargePower", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500"
              min="0"
              step="0.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Минимальный SOC (%)
            </label>
            <input
              type="number"
              value={settings.minSoc}
              onChange={(e) => handleNumberChange("minSoc", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500"
              min="0"
              max="100"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Максимальный SOC (%)
            </label>
            <input
              type="number"
              value={settings.maxSoc}
              onChange={(e) => handleNumberChange("maxSoc", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500"
              min="0"
              max="100"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* Карточка с параметрами сети и моделирования */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Сетевые взаимодействия */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Взаимодействие с внешней сетью
          </h2>

          <div className="space-y-5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700">
                Экспорт излишков в сеть
              </span>
              <input
                type="checkbox"
                checked={settings.gridExportEnabled}
                onChange={(e) => handleChange("gridExportEnabled", e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700">
                Импорт энергии из сети
              </span>
              <input
                type="checkbox"
                checked={settings.gridImportEnabled}
                onChange={(e) => handleChange("gridImportEnabled", e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        {/* Параметры моделирования */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Параметры моделирования
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Шаг симуляции (минут)
              </label>
              <select
                value={settings.simulationStep}
                onChange={(e) => handleChange("simulationStep", Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400"
              >
                <option value={15}>15 минут</option>
                <option value={30}>30 минут</option>
                <option value={60}>1 час</option>
                <option value={120}>2 часа</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Локация (для прогноза погоды)
              </label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400"
                placeholder="Например, Санкт-Петербург, Россия"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка сохранения (в будущем можно добавить реальное сохранение) */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Сохранить настройки
        </button>
      </div>
    </div>
  );
}