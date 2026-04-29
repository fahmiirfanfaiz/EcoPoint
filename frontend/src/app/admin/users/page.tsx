"use client";

import React from "react";
import { Users, MoreVertical, Edit2, Trash2 } from "lucide-react";

export default function AdminUsers() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito text-3xl font-extrabold text-gray-900">Manage Users</h1>
          <p className="text-gray-500 font-quicksand mt-1">View and manage registered students in EcoPoint.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-quicksand">
            <thead className="bg-gray-50 text-sm font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">NIM</th>
                <th className="px-6 py-4">Total Points</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                        U{item}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Student Name {item}</p>
                        <p className="text-xs text-gray-500">student{item}@ugm.ac.id</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600">20/45678{item}/TK/5432{item}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{Math.floor(Math.random() * 1000)} pts</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      mahasiswa
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors mr-2">
                      <Edit2 size={16} />
                    </button>
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
