"use client";
import React from "react";

type Room = {
  id: string;
  name: string;
  description?: string | null;
  max_kids?: number | null;
  active?: boolean | null;
};

export default function RoomCard({ room, tenant }: { room: Room; tenant: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
          <span className="text-xs text-gray-500">{tenant}</span>
        </div>
        {room.description ? (
          <p className="mt-2 text-sm text-gray-700">{room.description}</p>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No description.</p>
        )}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Max kids: {room.max_kids ?? "—"}</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${room.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
            {room.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
}
