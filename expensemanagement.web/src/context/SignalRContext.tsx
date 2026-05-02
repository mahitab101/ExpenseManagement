import React, { createContext, useContext, useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "./AuthContext"; // تأكدي من المسار الصحيح
import toast from "react-hot-toast";

type SignalRContextType = {
    connection: signalR.HubConnection | null;
    notifications: string[];
    clearNotifications: () => void;
};

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const SignalRProvider = ({ children }: { children: React.ReactNode }) => {
    const { accessToken, isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<string[]>([]);

    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    
    const clearNotifications = () => setNotifications([]);

useEffect(() => {
    // نفتح الاتصال فقط إذا لم يكن موجوداً أصلاً وكان المستخدم مسجلاً دخوله
    if (isAuthenticated && accessToken && !connection) {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5273/notificationHub", {
                accessTokenFactory: () => accessToken
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000]) // محاولات إعادة اتصال ذكية
            .build();

        newConnection.start()
            .then(() => {
                console.log("✅ Connected to SignalR Hub");
                setConnection(newConnection);
                
                newConnection.on("ReceiveNotification", (message) => {
                    setNotifications(prev => [...prev, message]);
                    toast.error(message);
                });
            })
            .catch(err => console.error("❌ Connection failed: ", err));

        // الـ Cleanup مهم جداً عند عمل Logout أو Unmount للمكون
        return () => {
            if (newConnection) {
                newConnection.stop();
            }
        };
    }
}, [isAuthenticated, accessToken]); // لا تضعي 'connection' هنا لمنع الـ Loop

    return (
       <SignalRContext.Provider value={{ connection, notifications, clearNotifications }}>
            {children}
        </SignalRContext.Provider>
    );
};

export const useSignalR = () => {
    const context = useContext(SignalRContext);
    if (context === undefined) {
        throw new Error("useSignalR must be used within a SignalRProvider");
    }
    return context;
};