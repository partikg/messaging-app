import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white gap-6">

      <h1 className="text-4xl font-bold">Chat App</h1>

      <p className="text-gray-400 text-center max-w">
        chat application to connect with each other
      </p>

      <div className="flex gap-4">
        <Link href="/login"
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded"
        >
          Login
        </Link>

        <Link href="/register"
          className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded"
        >
          Register
        </Link>
      </div>

    </div>
  );
}
