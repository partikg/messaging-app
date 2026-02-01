"use client";


import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:5000/api/auth/register", {
                name, email, password,
            });

            localStorage.setItem("token", res.data.token);

            router.push("/chat");
        } catch (err) {
            alert(err.response?.data?.message || "Register failed");
        }
    }
    return (
        <div className="h-screen flex items-center justify-center bg-black text-white">

            <Link
                href="/"
                className="fixed top-4 left-4 text-sm text-gray-400 hover:text-white"
            >
                ← Back
            </Link>


            <form onSubmit={handleSubmit} className="w-[320px] flex flex-col gap-4">

                <h1 className="text-2xl font-bold text-center">Register</h1>

                <input
                    placeholder="Name" value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-800 px-3 py-2 " />

                <input
                    placeholder="Email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800 px-3 py-2 " />

                <input
                    type="password"
                    placeholder="Password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800 px-3 py-2 " />

                <button type="submit" className="bg-blue-600  py-2 ">Register</button>

                <p className="text-sm text-gray-400 text-center">
                    already registered?{" "}
                    <Link href="/login" className="text-blue-500 cursor-pointer">
                        Login
                    </Link>
                </p>

            </form>
        </div>
    );
}
