"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type ConnectionResult = {
  success: boolean;
  message: string;
  details?: string;
  timestamp?: string;
};

export default function TestConnectionPage() {
  const [publishableResult, setPublishableResult] = useState<ConnectionResult | null>(null);
  const [secretResult, setSecretResult] = useState<ConnectionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const testPublishableKey = async () => {
    setLoading(true);
    setPublishableResult(null);

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (!url || url === "your-supabase-project-url") {
        setPublishableResult({
          success: false,
          message: "NEXT_PUBLIC_SUPABASE_URL belum dikonfigurasi",
          details: "Isi URL di file .env",
        });
        setLoading(false);
        return;
      }

      if (!key || key === "your-supabase-anon-publishable-key") {
        setPublishableResult({
          success: false,
          message: "Publishable key belum dikonfigurasi",
          details: "Isi NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY di file .env",
        });
        setLoading(false);
        return;
      }

      const startTime = performance.now();
      const { error } = await supabase
        .from("_test_connection")
        .select("*")
        .limit(1);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (error && error.message.includes("Invalid API key")) {
        setPublishableResult({
          success: false,
          message: "Publishable key tidak valid",
          details: error.message,
        });
      } else {
        setPublishableResult({
          success: true,
          message: `Koneksi berhasil! (${responseTime}ms)`,
          details: `Terhubung ke: ${url}`,
          timestamp: new Date().toLocaleString("id-ID"),
        });
      }
    } catch (err) {
      setPublishableResult({
        success: false,
        message: "Koneksi gagal",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const testSecretKey = async () => {
    setLoading(true);
    setSecretResult(null);

    try {
      const res = await fetch("/api/test-connection");
      const data = await res.json();

      setSecretResult({
        success: data.success,
        message: data.message,
        details: data.details,
        timestamp: data.timestamp,
      });
    } catch (err) {
      setSecretResult({
        success: false,
        message: "Gagal memanggil API route",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace", maxWidth: "800px" }}>
      <h2>Supabase Connection Test</h2>
      
      <hr style={{ margin: "20px 0" }} />

      {/* Test 1: Client Side */}
      <div style={{ marginBottom: "30px" }}>
        <h3>1. Client-Side Test (Publishable Key)</h3>
        <button 
          onClick={testPublishableKey} 
          disabled={loading}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          {loading ? "Testing..." : "Run Client Test"}
        </button>

        {publishableResult && (
          <div style={{ 
            marginTop: "10px", 
            padding: "15px", 
            backgroundColor: publishableResult.success ? "#000000ff" : "#000000ff",
            border: "1px solid #ccc"
          }}>
            <strong>Status: {publishableResult.success ? "SUCCESS" : "FAILED"}</strong>
            <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
              {JSON.stringify(publishableResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Test 2: Server Side */}
      <div>
        <h3>2. Server-Side Test (Secret Key via API)</h3>
        <button 
          onClick={testSecretKey} 
          disabled={loading}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          {loading ? "Testing..." : "Run Server API Test"}
        </button>

        {secretResult && (
          <div style={{ 
            marginTop: "10px", 
            padding: "15px", 
            backgroundColor: secretResult.success ? "#000000ff" : "#000000ff",
            border: "1px solid #ccc"
          }}>
            <strong>Status: {secretResult.success ? "SUCCESS" : "FAILED"}</strong>
            <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
              {JSON.stringify(secretResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}