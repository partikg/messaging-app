"use client";

import { useSocket } from "@/context/SocketContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "../logout/page";

export default function ChatPage() {
    const router = useRouter();
    const socket = useSocket();

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [userId, setUserId] = useState(null);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [image, setImage] = useState(null);
    const [chatUser, setChatUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }
        // const payload = JSON.parse(atob(token.split(".")[1]));
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUserId(payload.id);
        } catch {
            localStorage.removeItem("token");
            router.push("/login");
        }

    }, [router]);

    useEffect(() => {
        if (!socket || !selectedChatId) return;

        socket.emit("joinRoom", selectedChatId);
    }, [socket, selectedChatId]);

    useEffect(() => {
        if (!socket || !userId) return;

        const handler = (msg) => {
            console.log("RECEIVED MESSAGE:", msg);
            console.log("Message sender:", msg.sender);
            console.log("Current userId:", userId);

            if (msg.chat.toString() === selectedChatId) {
                setMessages((prev) => [
                    ...prev,
                    {
                        ...msg,
                        sender: msg.sender ? { ...msg.sender } : null
                    }
                ]);

            }
        };

        socket.on("receiveMessage", handler);

        return () => socket.off("receiveMessage", handler);
    }, [socket, userId, selectedChatId]);

    useEffect(() => {
        if (!selectedChatId) return;

        const fetchMessages = async () => {

            const token = localStorage.getItem("token");

            const res = await axios.get(
                `${API_URL}/api/message/${selectedChatId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
            );
            setMessages(res.data);
        };

        fetchMessages();
    }, [selectedChatId]);

    const sendMessage = () => {
        if (!text.trim() || !socket || !userId) return;

        socket.emit("sendMessage", {
            chatId: selectedChatId,
            content: text,
        });

        setText("");
    };

    const sendImage = async () => {
        if (!image || !selectedChatId) return;

        try {
            const token = localStorage.getItem("token");

            const formData = new FormData();
            formData.append("image", image);
            formData.append("chatId", selectedChatId);

            const res = await axios.post(
                `${API_URL}/api/message/image`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setImage(null);
        } catch (err) {
            console.error("Image send error:", err);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleSend = () => {
        // send image first 
        if (image) {
            sendImage();
            return;
        }

        // else send text
        if (text.trim()) {
            sendMessage();
        }
    };

    useEffect(() => {
        setMessages([]);
    }, [selectedChatId]);

    useEffect(() => {
        if (!userId) return;

        const fetchChats = async () => {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                `${API_URL}/api/chat`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setChats(res.data);
        };

        fetchChats();
    }, [userId]);

    useEffect(() => {
        if (!searchTerm) return setSearchResults([]);

        const fetchUsers = async () => {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                `${API_URL}/api/users?search=${searchTerm}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSearchResults(res.data);
        };

        fetchUsers();
    }, [searchTerm]);

    const startChat = async (otherUserId) => {
        const token = localStorage.getItem("token");

        const res = await axios.post(
            `${API_URL}/api/chat`,
            { userId: otherUserId },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const otherUser = searchResults.find(
            u => String(u._id) === String(otherUserId)
        );

        setChats(prev => {
            const filtered = prev.filter(c => c._id !== res.data._id);
            return [
                {
                    ...res.data,
                    users: [otherUser, { _id: userId }]
                },
                ...filtered
            ];
        });

        setSelectedChatId(res.data._id);
        setChatUser(otherUser);
        setSearchTerm("");
        setSearchResults([]);
    };

    return (
        <div className="bg-black text-white h-screen flex">

            {/* sidebar */}
            <div className="w-[300px] bg-[#0f172a] flex flex-col">

                <div className="h-[70px] flex items-center justify-center border-b border-gray-700">
                    <h2 className="text-xl font-semibold">Chat App</h2>
                </div>

                {/* search */}
                <div className="p-3 border border-gray-700">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400 "
                    />
                </div>

                {/* search result */}
                <div className="max-h-[100px] overflow-y-auto">
                    {searchResults.map(user => (
                        <div
                            key={user._id}
                            className="p-2 bg-gray-600 text-white cursor-pointer hover:bg-gray-700"
                            onClick={() => startChat(user._id)}
                        >
                            {user.name}
                        </div>
                    ))}
                </div>

                {/* userlist */}
                <div className=" h-[280px] flex flex-col items-start gap-[10px] px-3 mt-3  overflow-y-auto">

                    {chats.map((chat) => {
                        const otherUser = chat.users.find(
                            u => String(u._id) !== String(userId)
                        );

                        return (
                            <div
                                key={chat._id}
                                className="w-full flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-700"
                                onClick={() => {
                                    setSelectedChatId(chat._id);
                                    setChatUser(otherUser);
                                }}
                            >
                                <div className="w-[40px] h-[40px] bg-gray-400 rounded-full" />
                                <div>
                                    <h2 className="text-white text-md font-semibold">{otherUser?.name}</h2>
                                </div>
                            </div>
                        );
                    })}

                </div>

                {/* logout */}
                <div className="border border-white  mt-auto p-3 text-center">
                    <LogoutButton />
                </div>
            </div>


            {/* main chat */}
            <div className="border border-gray-700 flex flex-col flex-1">

                {/* title */}
                <div className="h-[70px] flex items-center px-5 border border-gray-700">
                    {/* <h2>UserName</h2> */}
                    <h2 className="text-xl font-semibold">
                        {chatUser ? chatUser.name : "Select a chat"}
                    </h2>
                </div>

                {/* messages */}
                <div className="flex-1  overflow-y-auto">

                    {userId && messages.map((msg) => {
                        const isMe =
                            msg.sender &&
                            String(msg.sender._id) === String(userId);

                        return (
                            <p
                                key={msg._id}
                                className={`text-white break-words ${isMe ? "text-right" : "text-left"}`}
                            >
                                <strong >{msg.sender?.name || "Unknown"}:</strong>
                                {msg.content}

                                {msg.image && (
                                    <>
                                        <br />
                                        <img
                                            src={`${API_URL}${msg.image}`}
                                            className="inline-block max-w-[200px] mt-1 border rounded"
                                        />
                                    </>
                                )}
                            </p>
                        );
                    })}

                </div>


                {/* inputs */}
                <div className="h-16 w-full flex items-center gap-3 p-2 border border-gray-700">

                    {/* image input */}
                    <label className="border-2 cursor-pointer flex items-center justify-center w-16 h-full">
                        Image
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </label>

                    {/* text input */}
                    <div className="flex-1 h-full">
                        <input
                            className="w-full h-full px-3 text-white border-2  border-gray-700 outline-none"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="type message" />
                    </div>

                    {/* send button */}
                    <button onClick={handleSend} className="w-24 h-full bg-green-600 text-white">Send</button>

                </div>

            </div>


        </div>
    );
}
