"use client";

import { useState } from "react";

export default function TestRegister() {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage("Registering...");

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok) {
            setMessage("✅ Success: " + data.message);
        } else {
            setMessage("❌ Error: " + data.message);
        }
    }

    return (
        <div className="p-10 max-w-md mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Test Registration</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Name"
                    className="p-2 border rounded text-black"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="p-2 border rounded text-black"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="p-2 border rounded text-black"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button type="submit" className="bg-green-600 text-white p-2 rounded">
                    Create User
                </button>
            </form>
            <p className="font-bold mt-4">{message}</p>
        </div>
    );
}