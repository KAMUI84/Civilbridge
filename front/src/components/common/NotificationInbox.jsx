import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import notificationsService from "../../services/notificationsService";
import { connectSocket } from "../../services/socketService";
import { useAuthStore } from "../../store/authStore";

function BellIcon({ active = false }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 18h8m-7 0a3 3 0 0 0 6 0m6-2H3c1.2-1.1 2-2.7 2-4.4V10a7 7 0 1 1 14 0v1.6c0 1.7.8 3.3 2 4.4Z"
        stroke={active ? "#2563eb" : "currentColor"}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationInbox({ compact = false, dark = false }) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ loading: false, error: "" });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setState({ loading: true, error: "" });
      const response = await notificationsService.list({ limit: 12 });
      setNotifications(response?.data || []);
      setUnreadCount(response?.unreadCount || 0);
      setState({ loading: false, error: "" });
    } catch (error) {
      setState({ loading: false, error: error.message || "Failed to load notifications." });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadNotifications();
  }, [isAuthenticated, loadNotifications]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const socket = connectSocket();

    const handleNotification = (payload) => {
      const nextNotification = {
        ...payload,
        id: String(payload.id),
        status: payload.status || "UNREAD",
      };
      setNotifications((current) => {
        const withoutExisting = current.filter((item) => String(item.id) !== String(nextNotification.id));
        return [nextNotification, ...withoutExisting].slice(0, 12);
      });
      setUnreadCount((current) => current + 1);
    };

    socket.on("notification:new", handleNotification);
    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [isAuthenticated]);

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => item.status === "UNREAD").length,
    [notifications],
  );

  const effectiveUnreadCount = unreadCount || unreadNotifications;

  const handleMarkRead = useCallback(async (notification) => {
    if (notification.status !== "UNREAD") {
      if (notification.actionUrl) navigate(notification.actionUrl);
      return;
    }

    try {
      await notificationsService.markRead(notification.id);
      setNotifications((current) =>
        current.map((item) =>
          String(item.id) === String(notification.id)
            ? { ...item, status: "READ", readAt: new Date().toISOString() }
            : item,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch {
      // Leave current state as-is if marking read fails.
    } finally {
      if (notification.actionUrl) navigate(notification.actionUrl);
    }
  }, [navigate]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications((current) =>
        current.map((item) => ({ ...item, status: "READ", readAt: item.readAt || new Date().toISOString() })),
      );
      setUnreadCount(0);
    } catch (error) {
      setState({ loading: false, error: error.message || "Failed to mark notifications as read." });
    }
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Notifications"
        style={{
          border: "1px solid transparent",
          background: "transparent",
          borderRadius: compact ? 10 : 12,
          color: dark ? "#334155" : "#0c1220",
          width: compact ? 40 : 42,
          height: compact ? 40 : 42,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <BellIcon active={open} />
        {effectiveUnreadCount > 0 ? (
          <span style={styles.badge}>{effectiveUnreadCount > 99 ? "99+" : effectiveUnreadCount}</span>
        ) : null}
      </button>

      {open ? (
        <div style={{ ...styles.dropdown, ...(dark ? styles.dropdownDark : styles.dropdownLight) }}>
          <div style={styles.header}>
            <div>
              <div style={styles.title}>Notifications</div>
              <div style={styles.subtitle}>{effectiveUnreadCount} unread</div>
            </div>
            <button type="button" onClick={handleMarkAllRead} style={styles.headerAction}>
              Mark all read
            </button>
          </div>

          <div style={styles.list}>
            {state.loading ? (
              Array.from({ length: 4 }).map((_, index) => <div key={index} style={styles.skeleton} />)
            ) : state.error ? (
              <div style={styles.stateBox}>
                <div style={styles.stateTitle}>Could not load notifications</div>
                <div style={styles.stateText}>{state.error}</div>
                <button type="button" onClick={loadNotifications} style={styles.inlineAction}>Retry</button>
              </div>
            ) : notifications.length === 0 ? (
              <div style={styles.stateBox}>
                <div style={styles.stateTitle}>No notifications yet</div>
                <div style={styles.stateText}>You will see new messages, approvals, and payment updates here.</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleMarkRead(notification)}
                  style={{
                    ...styles.item,
                    ...(notification.status === "UNREAD" ? styles.itemUnread : {}),
                  }}
                >
                  <div style={styles.itemBody}>
                    <div style={styles.itemTitle}>{notification.title}</div>
                    <div style={styles.itemText}>{notification.body}</div>
                    <div style={styles.itemMeta}>{formatTime(notification.createdAt)}</div>
                  </div>
                  {notification.status === "UNREAD" ? <span style={styles.dot} /> : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    padding: "0 5px",
    borderRadius: 999,
    background: "#ef4444",
    color: "#fff",
    fontSize: 10,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #ffffff",
  },
  dropdown: {
    position: "absolute",
    top: 48,
    right: 0,
    width: 360,
    maxWidth: "calc(100vw - 24px)",
    borderRadius: 16,
    border: "1px solid #e6ebf4",
    boxShadow: "0 18px 36px rgba(15,23,42,0.08)",
    overflow: "hidden",
    zIndex: 1200,
  },
  dropdownDark: {
    background: "#ffffff",
    color: "#0c1220",
  },
  dropdownLight: {
    background: "#ffffff",
    color: "#0c1220",
    border: "1px solid #e6ebf4",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 18px",
    borderBottom: "1px solid rgba(148,163,184,0.15)",
  },
  title: {
    fontSize: 15,
    fontWeight: 800,
  },
  subtitle: {
    fontSize: 12,
    color: "#8b97ab",
    marginTop: 3,
  },
  headerAction: {
    background: "transparent",
    border: "none",
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  list: {
    maxHeight: 420,
    overflowY: "auto",
    display: "grid",
  },
  item: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 18px",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(148,163,184,0.12)",
    textAlign: "left",
    cursor: "pointer",
  },
  itemUnread: {
    background: "rgba(59,130,246,0.06)",
  },
  itemBody: {
    display: "grid",
    gap: 6,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: 700,
  },
  itemText: {
    fontSize: 13,
    lineHeight: 1.5,
    color: "#94a3b8",
  },
  itemMeta: {
    fontSize: 11,
    color: "#64748b",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#3b82f6",
    flexShrink: 0,
    marginTop: 6,
  },
  skeleton: {
    height: 72,
    margin: "10px 16px",
    borderRadius: 12,
    background: "linear-gradient(90deg, rgba(148,163,184,0.08), rgba(148,163,184,0.16), rgba(148,163,184,0.08))",
  },
  stateBox: {
    padding: 24,
    textAlign: "center",
  },
  stateTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
  },
  stateText: {
    fontSize: 13,
    color: "#8b97ab",
    lineHeight: 1.5,
  },
  inlineAction: {
    marginTop: 14,
    border: "1px solid #2b3442",
    background: "transparent",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 700,
    color: "#dbe4f0",
    cursor: "pointer",
  },
};
