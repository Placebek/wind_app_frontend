import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
    PlusCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

const API_BASE = "http://localhost:8000/api/v1/solar";

export default function SolarSystemsListPage() {
    const [systems, setSystems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Форма создания
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: "",
        power_kw: "",
        efficiency: "",
        status: "Активна",
    });
    const [createErrors, setCreateErrors] = useState({});

    // Кастомные модалки
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
    const [messageModal, setMessageModal] = useState({
        open: false,
        type: "error",
        message: "",
    });

    useEffect(() => {
        fetchSystems();
    }, []);

    const fetchSystems = async () => {
        try {
            const response = await axios.get(`${API_BASE}/solar_system/`);
            setSystems(response.data);
        } catch (err) {
            setError("Не удалось загрузить системы");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const validateCreateForm = () => {
        const errors = {};
        if (!createForm.name.trim()) errors.name = "Название обязательно";
        if (!createForm.power_kw || createForm.power_kw <= 0)
            errors.power_kw = "Мощность должна быть > 0";
        if (
            createForm.efficiency &&
            (createForm.efficiency < 0 || createForm.efficiency > 100)
        )
            errors.efficiency = "КПД от 0 до 100";
        setCreateErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateSystem = async (e) => {
        e.preventDefault();
        if (!validateCreateForm()) return;

        try {
            const response = await axios.post(`${API_BASE}/solar_system/`, {
                name: createForm.name,
                power_kw: parseFloat(createForm.power_kw),
                efficiency: createForm.efficiency
                    ? parseFloat(createForm.efficiency)
                    : null,
                status: createForm.status,
            });
            setSystems((prev) => [...prev, response.data]);
            setShowCreateForm(false);
            setCreateForm({
                name: "",
                power_kw: "",
                efficiency: "",
                status: "Активна",
            });

            // Успешное уведомление
            setMessageModal({
                open: true,
                type: "success",
                message: "Система успешно создана!",
            });
        } catch (err) {
            console.error(err);
            setMessageModal({
                open: true,
                type: "error",
                message: "Ошибка при создании системы",
            });
        }
    };

    const handleDelete = async (id) => {
        setConfirmModal({ open: true, id });
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${API_BASE}/solar_system/${confirmModal.id}`);
            setSystems((prev) => prev.filter((s) => s.id !== confirmModal.id));
            setMessageModal({
                open: true,
                type: "success",
                message: "Система удалена",
            });
        } catch (err) {
            setMessageModal({
                open: true,
                type: "error",
                message: "Ошибка при удалении системы",
            });
        } finally {
            setConfirmModal({ open: false, id: null });
        }
    };

    // ==================== Модальные компоненты ====================

    const ConfirmModal = () => {
        if (!confirmModal.open) return null;

        return (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
                    <div className="flex items-center mb-4">
                        <ExclamationTriangleIcon className="h-10 w-10 text-red-500 mr-3" />
                        <h3 className="text-lg font-semibold">
                            Подтвердите удаление
                        </h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Вы уверены, что хотите удалить эту систему? Все
                        связанные данные будут безвозвратно удалены.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() =>
                                setConfirmModal({ open: false, id: null })
                            }
                            className="px-4 py-2 cursor-pointer text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-lg"
                        >
                            Удалить
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const MessageModal = () => {
        if (!messageModal.open) return null;

        const isError = messageModal.type === "error";
        const Icon = isError ? ExclamationTriangleIcon : CheckCircleIcon;
        const color = isError ? "text-red-500" : "text-green-500";

        return (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-fade-in">
                    <div className="flex items-center mb-4">
                        <Icon className={`h-10 w-10 ${color} mr-3`} />
                        <h3 className="text-lg font-semibold">
                            {isError ? "Ошибка" : "Успех"}
                        </h3>
                    </div>
                    <p className="text-gray-700 mb-6">{messageModal.message}</p>
                    <div className="flex justify-end">
                        <button
                            onClick={() =>
                                setMessageModal({
                                    open: false,
                                    type: "error",
                                    message: "",
                                })
                            }
                            className="px-6 py-2 cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ============================================================

    return (
        <div className="space-y-8 relative">
            {/* Остальной JSX остаётся почти без изменений */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Солнечные системы
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Управление солнечными электростанциями
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-5 py-3 rounded-lg shadow"
                >
                    <PlusCircleIcon className="h-6 w-6 mr-2" />
                    {showCreateForm ? "Отмена" : "Новая система"}
                </button>
            </div>

            {/* Форма создания — без изменений */}
            {showCreateForm && (
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Создать новую систему
                    </h2>
                    <form
                        onSubmit={handleCreateSystem}
                        className="grid grid-cols-1 md:grid-cols-4 gap-6"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Название
                            </label>
                            <input
                                type="text"
                                value={createForm.name}
                                onChange={(e) =>
                                    setCreateForm({
                                        ...createForm,
                                        name: e.target.value,
                                    })
                                }
                                className={`w-full border rounded-lg px-3 py-2 ${
                                    createErrors.name
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                placeholder="Моя СЭС-1"
                            />
                            {createErrors.name && (
                                <p className="text-red-500 text-xs mt-1">
                                    {createErrors.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Мощность (кВт)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={createForm.power_kw}
                                onChange={(e) =>
                                    setCreateForm({
                                        ...createForm,
                                        power_kw: e.target.value,
                                    })
                                }
                                className={`w-full border rounded-lg px-3 py-2 ${
                                    createErrors.power_kw
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                            />
                            {createErrors.power_kw && (
                                <p className="text-red-500 text-xs mt-1">
                                    {createErrors.power_kw}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                КПД (%)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={createForm.efficiency}
                                onChange={(e) =>
                                    setCreateForm({
                                        ...createForm,
                                        efficiency: e.target.value,
                                    })
                                }
                                className="w-full border rounded-lg px-3 py-2 border-gray-300"
                                placeholder="20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Статус
                            </label>
                            <select
                                value={createForm.status}
                                onChange={(e) =>
                                    setCreateForm({
                                        ...createForm,
                                        status: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            >
                                <option>Активна</option>
                                <option>Неактивна</option>
                                <option>На обслуживании</option>
                            </select>
                        </div>
                        <div className="md:col-span-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="flex items-center cursor-pointer bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                            >
                                <XCircleIcon className="h-5 w-5 mr-2" />
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="flex items-center cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                            >
                                <PlusCircleIcon className="h-5 w-5 mr-2" />
                                Создать
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading && <p className="text-center py-8">Загрузка систем...</p>}
            {error && <p className="text-red-600 text-center">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systems.map((system) => (
                    <NavLink
                        key={system.id}
                        to={`/solar/${system.id}`}
                        className="block bg-white rounded-xl shadow hover:shadow-lg transition p-6 border border-gray-200"
                    >
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">
                            {system.name}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p>
                                Мощность:{" "}
                                <span className="font-medium text-gray-800">
                                    {system.power_kw || 0} кВт
                                </span>
                            </p>
                            <p>
                                КПД:{" "}
                                <span className="font-medium text-gray-800">
                                    {system.efficiency || "-"} %
                                </span>
                            </p>
                            <p>
                                Статус:{" "}
                                <span className="font-medium text-green-600">
                                    {system.status || "Активна"}
                                </span>
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDelete(system.id);
                                }}
                                className="text-red-600 cursor-pointer hover:text-red-800 text-sm font-medium"
                            >
                                Удалить
                            </button>
                        </div>
                    </NavLink>
                ))}
            </div>

            {systems.length === 0 && !loading && !showCreateForm && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 mb-4">Нет солнечных систем</p>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="text-yellow-600 cursor-pointer hover:text-yellow-700 font-medium"
                    >
                        → Создать первую систему
                    </button>
                </div>
            )}

            <ConfirmModal />
            <MessageModal />
        </div>
    );
}
