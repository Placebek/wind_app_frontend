import { useEffect, useState } from "react";

// Моковые данные (оставляем те же)
const mockLogs = [
  {
    id: 1,
    timestamp: "2025-12-16T10:00:00Z",
    solar_ac: 4.82,
    wind_ac: 8.15,
    load: 10.2,
    soc: 0.78,
    action: "discharge",
    reward: 0.92,
  },
  {
    id: 2,
    timestamp: "2025-12-16T09:00:00Z",
    solar_ac: 3.21,
    wind_ac: 7.90,
    load: 9.8,
    soc: 0.82,
    action: "charge",
    reward: -0.15,
  },
  {
    id: 3,
    timestamp: "2025-12-16T08:00:00Z",
    solar_ac: 1.10,
    wind_ac: 9.45,
    load: 11.5,
    soc: 0.75,
    action: "discharge",
    reward: 0.88,
  },
  ...Array.from({ length: 27 }, (_, i) => ({
    id: i + 4,
    timestamp: `2025-12-16T${String(7 - (i % 8)).padStart(2, "0")}:00:00Z`,
    solar_ac: (Math.random() * 6 + 0.5).toFixed(2),
    wind_ac: (Math.random() * 12 + 2).toFixed(2),
    load: (Math.random() * 15 + 5).toFixed(2),
    soc: Math.random() * 0.6 + 0.3,
    action: ["charge", "discharge", "idle"][Math.floor(Math.random() * 3)],
    reward: (Math.random() * 2 - 0.5).toFixed(2),
  })),
].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

export default function DataPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/logs")
      .then((res) => {
        if (!res.ok) throw new Error("Не удалось загрузить данные");
        return res.json();
      })
      .then((json) => {
        const sorted = json.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setData(sorted);
        setError(null);
      })
      .catch((err) => {
        console.error("Ошибка загрузки логов:", err);
        setError(err.message);
        setData(mockLogs);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const currentData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));

  const getActionBadge = (action) => {
    switch (action) {
      case "charge":
        return { text: "Зарядка", color: "bg-blue-100 text-blue-800" };
      case "discharge":
        return { text: "Разрядка", color: "bg-orange-100 text-orange-800" };
      case "idle":
        return { text: "Ожидание", color: "bg-gray-100 text-gray-700" };
      default:
        return { text: action, color: "bg-gray-100 text-gray-700" };
    }
  };

  const getRewardClass = (reward) => {
    if (reward > 0) return "text-green-600 font-semibold";
    if (reward < 0) return "text-red-600 font-semibold";
    return "text-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          📊 Логи модели микросети
        </h1>
        <p className="text-gray-500 text-sm">
          История работы системы: генерация, нагрузка, состояние батареи и решения RL-агента.
        </p>
      </div>

      {/* Таблица с новым стильным дизайном */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4">Загрузка логов...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Время</th>
                    <th className="px-6 py-4 font-medium">Солнечная (кВт)</th>
                    <th className="px-6 py-4 font-medium">Ветер (кВт)</th>
                    <th className="px-6 py-4 font-medium">Нагрузка (кВт)</th>
                    <th className="px-6 py-4 font-medium">SOC батареи</th>
                    <th className="px-6 py-4 font-medium">Действие</th>
                    <th className="px-6 py-4 font-medium text-right">Вознаграждение</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-400 italic">
                        Нет данных для отображения
                      </td>
                    </tr>
                  ) : (
                    currentData.map((row, index) => {
                      const actionBadge = getActionBadge(row.action);
                      return (
                        <tr
                          key={row.id}
                          className={`hover:bg-indigo-25 transition-colors ${
                            index % 2 === 0 ? "bg-gray-25" : "bg-white"
                          }`}
                        >
                          <td className="px-6 py-4 font-medium text-gray-800">
                            {new Date(row.timestamp).toLocaleString("ru-RU", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {row.solar_ac != null ? Number(row.solar_ac).toFixed(2) : "—"}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {row.wind_ac != null ? Number(row.wind_ac).toFixed(2) : "—"}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {row.load != null ? Number(row.load).toFixed(2) : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-indigo-700">
                              {(row.soc * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium ${actionBadge.color}`}
                            >
                              {actionBadge.text}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-right ${getRewardClass(row.reward)}`}>
                            {row.reward != null ? (
                              <>
                                {row.reward > 0 ? "+" : ""}
                                {Number(row.reward).toFixed(2)}
                              </>
                            ) : "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Современная пагинация */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <button
                  onClick={prevPage}
                  disabled={page === 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  ← Предыдущая
                </button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Страница
                  </span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 font-semibold rounded-md">
                    {page}
                  </span>
                  <span className="text-sm text-gray-600">
                    из {totalPages}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({data.length} записей)
                  </span>
                </div>

                <button
                  onClick={nextPage}
                  disabled={page === totalPages}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Следующая →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}