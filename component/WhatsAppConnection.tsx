"use client";
import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { io, Socket } from 'socket.io-client';

const WhatsAppConnection: React.FC = () => {
  const [qrCode, setQrCode] = useState<string>('');
  const [status, setStatus] = useState<string>('Menginisialisasi Socket...');
  const [isReady, setIsReady] = useState<boolean>(false);
  const [debugLog, setDebugLog] = useState<string[]>([]); // Untuk menampilkan log di layar (opsional)

  // Helper untuk nambah log ke layar & console
  const addLog = (msg: string) => {
    console.log(`%c[WA-DEBUG] ${msg}`, 'color: #00aaff; font-weight: bold;');
    setDebugLog(prev => [msg, ...prev].slice(0, 5)); // Simpan 5 log terakhir
  };

  useEffect(() => {
    //addLog("Mounting Component...");

    // 1. Inisialisasi Socket
    // Pastikan URL ini benar. Jika backend di port 3001, harus http://localhost:3001
    const rawUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!rawUrl) {
      console.error('NEXT_PUBLIC_API_URL is not defined');
      return;
    }
    const socketUrl = new URL(rawUrl).origin; 
    
    // AMBIL ORIGIN SAJA (Hapus /api, /v1, dll)
    // Contoh: "http://localhost:3001/api" -> "http://localhost:3001"
    //const socketUrl = new URL(rawUrl).origin; 
    
    //addLog(`Target Socket URL: ${socketUrl}`); // Cek log ini di layar nanti

    // 2. Inisialisasi Socket dengan URL yang sudah bersih
    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'], 
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    // 2. LISTENER SYSTEM (Koneksi)
    socket.on('connect', () => {
      addLog(`✅ TERHUBUNG! Socket ID: ${socket.id}`);
      addLog(`Transport: ${socket.io.engine.transport.name}`); // Cek apakah websocket atau polling
      setStatus('Terhubung. Menunggu Data...');
      
      // Request status terbaru manual (Optional: jika backend support)
      // socket.emit('REQUEST_STATUS'); 
    });

    socket.on('connect_error', (err) => {
      addLog(`❌ GAGAL KONEK: ${err.message}`);
      setStatus(`Error Koneksi: ${err.message}`);
    });

    socket.on('disconnect', (reason) => {
      addLog(`⚠️ TERPUTUS: ${reason}`);
      setStatus('Koneksi Terputus.');
    });

    socket.on('reconnect_attempt', (attempt) => {
      addLog(`🔄 Mencoba Reconnect... (${attempt})`);
    });

    // 3. LISTENER WILDCARD (Menangkap SEMUA event dari backend)
    // Ini sangat berguna untuk melihat apakah ada event yang namanya typo
    socket.onAny((eventName, ...args) => {
      addLog(`⚡ EVENT MASUK: "${eventName}"`);
      console.log('📦 Data Event:', args);
    });

    // 4. LISTENER SPESIFIK APLIKASI
    socket.on('WA_QR', (qr: string) => {
      addLog('📷 QR Code Diterima');
      setQrCode(qr);
      setStatus('Scan QR Code ini');
      setIsReady(false);
    });

    socket.on('WA_READY', (state: boolean) => {
      addLog('✅ Bot Ready');
      setQrCode('');
      setStatus('WhatsApp Bot Siap! ✅');
      setIsReady(true);
    });

    socket.on('WA_AUTH', (msg: string) => {
       addLog(`🔑 Auth Status: ${msg}`);
       setStatus(msg);
    });

    // Cleanup
    return () => {
      addLog("Unmounting Component & Disconnecting...");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-4 border border-gray-200 rounded-lg text-center bg-white w-full">
      <h3 className="text-lg font-bold mb-2 text-gray-800">Debug Koneksi</h3>
      
      {/* Status Utama */}
      <p className={`font-semibold text-sm mb-4 ${isReady ? 'text-green-600' : 'text-orange-500'}`}>
        {status}
      </p>

      {/* Area QR Code */}
      {qrCode && !isReady && (
        <div className="flex justify-center my-2 p-2 bg-white border border-gray-100 rounded shadow-sm inline-block">
          <QRCodeCanvas value={qrCode} size={200} level={"L"} />
        </div>
      )}

      {isReady && <div className="text-4xl animate-bounce mt-2">🤖✅</div>}

      {/* AREA LOG DEBUG VISUAL (Hanya untuk dev) */}
      {/* <div className="mt-6 text-left bg-gray-900 text-green-400 p-3 rounded text-xs font-mono h-32 overflow-y-auto">
        <p className="text-gray-500 mb-1 border-b border-gray-700 pb-1">CONSOLE LOGS:</p>
        {debugLog.map((log, i) => (
          <div key={i} className="mb-1 border-b border-gray-800 pb-1">
            {`> ${log}`}
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default WhatsAppConnection;