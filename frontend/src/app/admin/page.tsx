"use client";

import React from "react";
import { Users, Target, CheckCircle, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "1,248",
      trend: "+12%",
      icon: Users,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
    },
    {
      title: "Active Challenges",
      value: "24",
      trend: "+4%",
      icon: Target,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
    },
    {
      title: "Reports Resolved",
      value: "856",
      trend: "+28%",
      icon: CheckCircle,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
    },
    {
      title: "Points Distributed",
      value: "45K",
      trend: "+15%",
      icon: TrendingUp,
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-nunito text-3xl font-extrabold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-gray-500 font-quicksand">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.lightColor} text-white transition-transform group-hover:scale-110`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <TrendingUp size={14} />
                  {stat.trend}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-quicksand text-sm font-medium text-gray-500">{stat.title}</h3>
                <p className="mt-1 font-nunito text-3xl font-extrabold text-gray-900">{stat.value}</p>
              </div>
              <div className={`absolute bottom-0 left-0 h-1 w-full scale-x-0 transition-transform group-hover:scale-x-100 origin-left ${stat.color}`}></div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Table (Mock) */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="font-nunito text-lg font-bold text-gray-900">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-quicksand">
            <thead className="bg-gray-50 text-sm font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Points</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500"></div>
                      <span>User {item}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">Completed Daily Challenge</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">+50</td>
                  <td className="px-6 py-4 text-gray-500">10 mins ago</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      Success
                    </span>
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
