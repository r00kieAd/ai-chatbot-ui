import React, { useEffect, useState } from 'react';
import { useGlobal } from '../utils/global_context';
import './notification.css';

const Notification: React.FC = () => {
    const { notification, setNotification } = useGlobal();
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        setIsClosing(false);
        if (notification) {
            const timer = setTimeout(() => {
                handleClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setNotification(null);
        }, 300);
    };

    if (!notification) return null;

    return (
        <div className={`notification notification-${notification.type} ${isClosing ? 'notification-closing' : ''}`}>
            <div className="notification-inner">
                <span className="notification-message">{notification.message}</span>
                <button 
                    className="notification-close"
                    onClick={handleClose}
                    aria-label="Close notification"
                    type="button"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default Notification;
