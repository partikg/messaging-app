"use client";

import { useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketContext";

export default function LogoutButton() {
    const router = useRouter();
    const socket = useSocket();

    const logout = () => {
        if (socket) socket.disconnect();
        localStorage.removeItem("token");
        // router.push("/login");
        window.location.href = "/login";
    };

    return <button onClick={logout}>Logout</button>;
}
