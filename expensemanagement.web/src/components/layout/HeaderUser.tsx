// import { useState, useRef, useEffect } from "react";
// import { Bell, Moon, ChevronDown, User, Settings, LogOut } from "lucide-react";
// import { useLogout } from "@/hooks/useLogout";
// import { useAuth } from "@/context/AuthContext";

// export default function HeaderUser() {
//   const [open, setOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   const {user} = useAuth();
//    const { mutate: logout, isPending } = useLogout();

//   useEffect(() => {
//     function handleClickOutside(e: MouseEvent) {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="flex items-center gap-4">

//       {/* Dark Mode */}
//       <button className="w-10 h-10 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50">
//         <Moon size={18} />
//       </button>

//       {/* Notifications */}
//       <button className="relative w-10 h-10 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50">
//         <Bell size={18} />
//         <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>
//       </button>

//       {/* User Dropdown */}
//       <div ref={dropdownRef} className="relative">
//         <div
//           onClick={() => setOpen(!open)}
//           className="flex items-center gap-2 cursor-pointer"
//         >
//           <img
//             src="https://i.pravatar.cc/40"
//             className="w-10 h-10 rounded-full border"
//           />
//           <span className="text-sm font-medium">{user?.userName}</span>
//           <ChevronDown
//             size={16}
//             className={`transition ${open ? "rotate-180" : ""}`}
//           />
//         </div>

//         {/* Dropdown */}
//         {open && (
//           <div className="absolute right-0 mt-3 w-48 bg-white border rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95">

//             <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
//               <User size={16} /> Profile
//             </button>

//             <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
//               <Settings size={16} /> Settings
//             </button>

//             <div className="border-t my-1"></div>

//             <button
//             onClick={() => logout()} disabled={isPending}
//              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50">
//               <LogOut size={16} />
//                Logout
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState, useRef, useEffect } from "react";
import { Bell, Moon, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSignalR } from "@/context/SignalRContext"; 
import { useTranslation } from "react-i18next";
import { useAuthActions } from "@/hooks/useAuthActions";
import { Link } from "@tanstack/react-router";

export default function HeaderUser() {

  const { i18n } = useTranslation()

  const currentLang = i18n.language === "ar" ? "AR" : "EN";

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false); // حالة لقائمة الإشعارات
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { logout,isLoggingOut } = useAuthActions();
  const { notifications, clearNotifications } = useSignalR(); // جلب الإشعارات من السياق

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }

    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
  const isArabic = i18n.language === "ar";

  document.documentElement.dir = isArabic ? "rtl" : "ltr";
  document.documentElement.lang = isArabic ? "ar" : "en";
}, [i18n.language]);

  return (
    <div className="flex items-center gap-4">
      {/* Language Dropdown */}
      <div ref={langRef} className="relative">
        <button
          onClick={() => setLangOpen(!langOpen)}
          className="flex items-center gap-2 px-3 h-10 rounded-full border bg-white hover:bg-gray-50 text-sm font-medium"
        >
          {currentLang}
          <ChevronDown
            size={14}
            className={`transition ${langOpen ? "rotate-180" : ""}`}
          />
        </button>

        {langOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95">

            {/* English */}
            <button
              onClick={() => {
                i18n.changeLanguage("en");
                setLangOpen(false);
              }}
              className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${i18n.language === "en" ? "bg-gray-100 font-semibold" : ""
                }`}
            >
              English
            </button>

            {/* Arabic */}
            <button
              onClick={() => {
                i18n.changeLanguage("ar");
                setLangOpen(false);
              }}
              className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${i18n.language === "ar" ? "bg-gray-100 font-semibold" : ""
                }`}
            >
              العربية
            </button>
          </div>
        )}
      </div>
      {/* Dark Mode */}
      <button className="w-10 h-10 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50">
        <Moon size={18} />
      </button>

      {/* Notifications */}
      <div className="relative" ref={notificationRef}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative w-10 h-10 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50"
        >
          <Bell size={18} />

          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center 
          bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white">
              {notifications.length}
            </span>
          )}
        </button>

        {/* notifications */}
        {showNotifications && (
          <div className="absolute right-0 mt-3 w-72 bg-white border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
            <div className="px-4 py-2 border-b font-medium text-sm flex justify-between items-center">
              <span>Notifications</span>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
              ) : (
                notifications.map((note, index) => (
                  <div key={index} className="px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition">
                    <p className="text-sm text-gray-800">{note}</p>
                    <span className="text-[10px] text-gray-400">Now</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Dropdown */}
      <div ref={dropdownRef} className="relative">
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img
            src={"https://i.pravatar.cc/40"}
            alt={user?.userName}
            className="w-10 h-10 rounded-full border"
          />
          <span className="text-sm font-medium">{user?.userName}</span>
          <ChevronDown
            size={16}
            className={`transition ${open ? "rotate-180" : ""}`}
          />
        </div>

        {/* Dropdown Menu */}
        {open && (
          <div className="absolute right-0 mt-3 w-48 bg-white border rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 z-50">
            <Link to='/dashboard/user/profile'> <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
             <User size={16} /> Profile
            </button>
            </Link>
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
              <Settings size={16} /> Settings
            </button>
            <div className="border-t my-1"></div>
            <button
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}