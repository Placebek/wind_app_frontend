import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  ChartBarIcon,
  SunIcon,
  CloudIcon,
  Cog6ToothIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

const navItems = [
  { name: "Главная", path: "/", icon: HomeIcon },
  { name: "Данные", path: "/data", icon: ChartBarIcon },
  { name: "Солнце", path: "/solar", icon: SunIcon },
  { name: "Ветер", path: "/wind", icon: CloudIcon },
  { name: "Настройки", path: "/settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`${
        isOpen ? "w-56" : "w-16"
      } bg-gray-900 text-gray-200 flex flex-col transition-all duration-300`}
    >
      {/* Верхняя панель с логотипом и кнопкой */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
        <span
          className={`text-lg font-semibold transition-opacity ${
            isOpen ? "opacity-100" : "opacity-0 hidden"
          }`}
        >
          ⚡ WindApp
        </span>
        <button onClick={() => setIsOpen(!isOpen)}>
          <Bars3Icon className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer" />
        </button>
      </div>

      {/* Навигация */}
      <nav className="flex-1 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-5 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "hover:bg-gray-800 hover:text-white text-gray-400"
              }`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {isOpen && <span className="ml-3">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Нижняя панель */}
      <div className="text-xs text-center text-gray-500 py-3 border-t border-gray-700">
        {isOpen ? "@2025 Designed by Jake" : "v1.0"}
      </div>
    </aside>
  );
}
