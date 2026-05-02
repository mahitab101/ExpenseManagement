import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

const useSignalR = (token) => {
    const [connection, setConnection] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // 1. إعداد الاتصال
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7123/notificationHub", { // استبدلي بـ URL الـ API الخاص بكِ
                accessTokenFactory: () => token // تمرير الـ JWT Token
            })
            .withAutomaticReconnect() // إعادة الاتصال تلقائياً عند انقطاع الإنترنت
            .build();

        setConnection(newConnection);
    }, [token]);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log("Connected to SignalR Hub!");

                    // 2. الاستماع للميثود التي حددناها في الـ Backend
                    connection.on("ReceiveNotification", (message) => {
                        setNotifications(prev => [...prev, message]);
                        
                        // يمكنك هنا إضافة مكتبة مثل react-toastify لإظهار رسالة منبثقة
                        console.log("New Notification:", message);
                    });
                })
                .catch(error => console.error("Connection failed: ", error));
        }
    }, [connection]);

    return { notifications };
};

export default useSignalR;