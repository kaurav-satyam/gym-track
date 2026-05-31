import { useEffect, useState } from "react";
import { db } from "../app/db";

export default function TestDexie() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  async function loadMessages() {
    const all = await db.msg.toArray();
    setMessages(all);
  }

  async function addMessage() {
    if (!text) return;

    await db.msg.add({
      msg: text,
    });

    setText("");
    loadMessages();
  }

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div className="p-4">
      <input
        className="border p-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button className="ml-2 border px-4 py-2" onClick={addMessage}>
        Save
      </button>

      <div className="mt-4">
        {messages.map((m) => (
          <div key={m.id}>{m.msg}</div>
        ))}
      </div>
    </div>
  );
}
