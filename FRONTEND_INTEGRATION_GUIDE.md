# Dokumentasi Update Backend - Rate Limiting & Queue System

**Versi:** 2.0.0  
**Tanggal:** 2026-10-02  
**Penulis:** Backend Team  
**Status:** ✅ Ready for Deployment

---

## 📋 Rangkaian Update (2025-2026)

### Versi 1.0 - Rate Limiting Keluar (Sudah Deploy)
- Token Bucket Rate Limiter (25 msg/sec)
- Message Queue untuk broadcast
- Auto-retry 429 dengan exponential backoff
- Per-user cooldown 3 detik

### Versi 3.0 - Bot Token Management + WebSocket Health Monitoring
- **Bot Token CRUD API** (NEW) - manage multiple bot tokens
- **WebSocket Live Health Monitor** (NEW) - real-time bot status + queue stats
- **Token Health Check** - detects frozen/banned/invalid tokens automatically
- Admin seed account (user: admin, pass: 12345)

### Versi 2.0 - Rate Limiting Masuk + Dual Scheduling
- **Incoming Callback Queue** (NEW v2.0) - handle 3.300 jawaban/hari
- **Dual Scheduling Mode** (NEW) - manual + automated
- **Queue Monitoring** endpoints (NEW)
- Settings API untuk konfigurasi otomatis

---

## 🔗 Endpoint Lengkap

### 📤 Outgoing (Rate Limiting Keluar)

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/admin/telegram/queue-stats` | GET | Statistik antrian kirim |
| `/api/admin/telegram/rate-limiter-stats` | GET | Statistik rate limiter |
| `/api/admin/telegram/test-broadcast` | POST | Test kirim ke N user |

### 📥 Incoming (Rate Limiting Masuk)

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/admin/telegram/callback-queue-stats` | GET | Statistik antrian jawaban |
| `/api/admin/telegram/callback-queue-clear` | POST | Emergency clear antrian |

### ⚙️ Settings & Scheduling

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/admin/settings/scheduling-mode` | GET | Cek mode saat ini |
| `/api/admin/settings/scheduling-mode` | PUT | Ganti mode (`manual`/`automated`) |
| `/api/admin/settings/automated-config` | GET | Lihat config automated |
| `/api/admin/settings/automated-config` | PUT | Update config automated |
| `/api/admin/settings/preview-schedule` | GET | Preview jadwal hari ini |
| `/api/admin/settings/generate-schedule` | POST | Manual trigger generate |

### 🔐 Bot Token Management (NEW v3.0)

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/admin/telegram/tokens` | GET | Dapatkan semua bot token |
| `/api/admin/telegram/tokens` | POST | Tambah token bot baru |
| `/api/admin/telegram/tokens/:id` | PUT | Update token bot |
| `/api/admin/telegram/tokens/:id` | DELETE | Hapus token bot |
| `/api/admin/telegram/tokens/activate` | PUT | Aktifkan token khusus |
| `/api/admin/telegram/tokens/health` | GET | Health check semua token |
| `/api/admin/telegram/tokens/active/health` | GET | Health check token aktif |
| `/api/admin/telegram/tokens/:id/health` | GET | Health check token spesifik |

---

## 🟢 WebSocket - Live Health Monitoring (NEW v3.0)

### Connection
```javascript
import { io } from 'socket.io-client';
const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 10
});
```

### Subscribe/Unsubscribe Events
```javascript
// Subscribe
socket.emit('subscribe_health');

// Listen
socket.on('bot_health_update', (data) => {
  console.log('Live bot health:', data);
});

socket.on('bot_health_error', (error) => {
  console.error('Health check error:', error.error);
});

// Unsubscribe
socket.emit('unsubscribe_health');
```

### Live Health Payload (`bot_health_update`)
```json
{
  "timestamp": "2026-10-02T10:58:58.000Z",
  "active_token": "732910:***:***:Ok",
  "health": {
    "available": true,
    "status": "active",
    "bot_info": { "id": 123456789, "first_name": "Bruxism Bot", "username": "bruxism_main_bot" },
    "diagnosis": "Token active dan siap digunakan",
    "recommended_action": "Tidak ada tindakan diperlukan"
  },
  "all_tokens": [
    { "id": 1, "name": "Main Bot", "status": "active", "available": true },
    { "id": 2, "name": "Backup Bot", "status": "invalid_token", "available": false }
  ],
  "queues": {
    "outgoing": { "currentQueueSize": 4, "processed": 1500, "rateLimiter": {"totalRateLimited": 0} },
    "incoming": { "currentQueueSize": 0, "processed": 850, "avgProcessingTime": 45 }
  }
}
```

### React Component Example (LiveHealthMonitor)
```tsx
const LiveHealthMonitor = () => {
  const [health, setHealth] = useState(null);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.emit('subscribe_health');
    
    newSocket.on('connect', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));
    newSocket.on('bot_health_update', data => setHealth(data));
    newSocket.on('bot_health_error', error => console.error(error));

    return () => newSocket.close();
  }, []);

  if (!connected) return <div>Connecting to health monitor...</div>;
  if (!health) return <div>Waiting for health data...</div>;

  return (
    <Card>
      <CardHeader>
        <Flex justify="space-between">
          <Heading>Live Bot Health</Heading>
          <Badge colorScheme={health.health.available ? 'green' : 'red'}>
            {health.health.status}
          </Badge>
        </Flex>
      </CardHeader>
      <CardBody>
        <Stat>
          <StatLabel>Bot</StatLabel>
          <StatNumber>{health.health.bot_info?.first_name || 'N/A'}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Outgoing Queue</StatLabel>
          <StatNumber>{health.queues.outgoing.currentQueueSize}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Incoming Queue</StatLabel>
          <StatNumber>{health.queues.incoming.currentQueueSize}</StatNumber>
        </Stat>
        <Alert status={health.health.available ? 'success' : 'error'}>
          {health.health.diagnosis}
        </Alert>
      </CardBody>
    </Card>
  );
};
```

---

### 📋 Token CRUD Component (React)
```tsx
const TokenManagement = () => {
  const [tokens, setTokens] = useState([]);
  const [newToken, setNewToken] = useState('');
  const [newName, setNewName] = useState('');

  const fetchTokens = async () => {
    const res = await api.get('/admin/telegram/tokens');
    setTokens(res.data.data);
  };

  const createToken = async () => {
    await api.post('/admin/telegram/tokens', { token: newToken, name: newName });
    fetchTokens();
    setNewToken('');
    setNewName('');
  };

  const deleteToken = async (id) => {
    await api.delete(`/admin/telegram/tokens/${id}`);
    fetchTokens();
  };

  const checkHealth = async () => {
    const res = await api.get('/admin/telegram/tokens/health');
    console.log(res.data.summary);
  };

  // Render token list with health indicators
  return (
    <Flex direction="column" gap={4}>
      {tokens.map(token => (
        <Card key={token.id}>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="bold">{token.name}</Text>
                <code>{token.token_preview}</code>
                <Badge colorScheme={token.is_active ? 'green' : 'gray'}>
                  {token.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {token.is_default && <Badge variant="outline">Default</Badge>}
                <Badge colorScheme={token.available ? 'green' : 'red'}>
                  {token.status}
                </Badge>
              </Box>
              <Button onClick={() => deleteToken(token.id)} colorScheme="red">
                Delete
              </Button>
            </Flex>
          </CardBody>
        </Card>
      ))}
    </Flex>
  );
};
```

## 📊 Monitoring Dashboard - Full Stack Implementation

### React Components

#### 1. TelegramStatusDashboard (Full Monitoring)

```tsx
import React, { useState, useEffect } from 'react';
import { Card, Grid, Stat, StatGroup, StatLabel, StatNumber, StatHelpText, Alert, Badge, Button, Loading } from '@chakra-ui/react';
import { FiSend, FiInbox, FiActivity, FiSettings } from 'react-icons/fi';

interface QueueStats {
  enqueued: number;
  processed: number;
  failed: number;
  deduplicated: number;
  currentQueueSize: number;
  queueSizes: { high: number; normal: number; low: number; total: number };
  rateLimiter: { totalSent: number; totalRetried: number; totalRateLimited: number; totalFailed: number };
}

interface CallbackStats {
  received: number;
  processed: number;
  currentQueueSize: number;
  peakQueueSize: number;
  avgProcessingTime: number;
  isProcessing: boolean;
}

const TelegramStatusDashboard: React.FC = () => {
  const [outgoingStats, setOutgoingStats] = useState<QueueStats | null>(null);
  const [incomingStats, setIncomingStats] = useState<CallbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [outRes, inRes] = await Promise.all([
        apiClient.get('/admin/telegram/queue-stats'),
        apiClient.get('/admin/telegram/callback-queue-stats')
      ]);
      setOutgoingStats(outRes.data.data);
      setIncomingStats(inRes.data.data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat statistik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll setiap 5 detik
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loading />;

  const isOutgoingHealthy = outgoingStats && outgoingStats.currentQueueSize < 100;
  const isIncomingHealthy = incomingStats && incomingStats.currentQueueSize < 1000;

  return (
    <Card>
      <CardHeader>
        <Flex justify="space-between" align="center">
          <Heading size="md">Telegram Bot Dashboard</Heading>
          <Badge colorScheme={isOutgoingHealthy && isIncomingHealthy ? 'green' : 'red'}>
            {isOutgoingHealthy && isIncomingHealthy ? 'All Systems Operational' : 'Issues Detected'}
          </Badge>
        </Flex>
      </CardHeader>

      <CardBody>
        <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
          
          {/* Outgoing Queue Stats */}
          <Card variant="outline" borderColor={isOutgoingHealthy ? 'green.200' : 'red.200'}>
            <CardHeader>
              <Stat>
                <Flex align="center" gap={2}>
                  <FiSend size={20} />
                  <StatLabel>Outgoing Queue (Kirim Pesan)</StatLabel>
                </Flex>
              </Stat>
            </CardHeader>
            <CardBody>
              {outgoingStats && (
                <StatGroup>
                  <Stat>
                    <StatLabel>Dalam Antrian</StatLabel>
                    <StatNumber>{outgoingStats.currentQueueSize}</StatNumber>
                    <StatHelpText>Peak: {outgoingStats.enqueued}</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Terproses (Total)</StatLabel>
                    <StatNumber>{outgoingStats.processed}</StatNumber>
                    <StatHelpText>Gagal: {outgoingStats.failed}</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Rate Limited</StatLabel>
                    <StatNumber>{outgoingStats.rateLimiter.totalRateLimited}</StatNumber>
                    <StatHelpText>Retry: {outgoingStats.rateLimiter.totalRetried}</StatHelpText>
                  </Stat>
                </StatGroup>
              )}
            </CardBody>
          </Card>

          {/* Incoming Callback Stats */}
          <Card variant="outline" borderColor={isIncomingHealthy ? 'green.200' : 'red.200'}>
            <CardHeader>
              <Stat>
                <Flex align="center" gap={2}>
                  <FiInbox size={20} />
                  <StatLabel>Incoming Queue (Jawaban User)</StatLabel>
                </Flex>
              </Stat>
            </CardHeader>
            <CardBody>
              {incomingStats && (
                <StatGroup>
                  <Stat>
                    <StatLabel>Diterima</StatLabel>
                    <StatNumber>{incomingStats.received}</StatNumber>
                    <StatHelpText>Diproses: {incomingStats.processed}</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Dalam Antrian</StatLabel>
                    <StatNumber>{incomingStats.currentQueueSize}</StatNumber>
                    <StatHelpText>Peak: {incomingStats.peakQueueSize}</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Rata-rata Proses</StatLabel>
                    <StatNumber>{Math.round(incomingStats.avgProcessingTime)}ms</StatNumber>
                    <StatHelpText>{incomingStats.isProcessing ? 'Processing...' : 'Idle'}</StatHelpText>
                  </Stat>
                </StatGroup>
              )}
            </CardBody>
          </Card>

          {/* Queue Breakdown */}
          <Card variant="outline">
            <CardHeader>
              <Stat>
                <Flex align="center" gap={2}>
                  <FiActivity size={20} />
                  <StatLabel>Priority Queue Breakdown</StatLabel>
                </Flex>
              </Stat>
            </CardHeader>
            <CardBody>
              {outgoingStats && (
                <StatGroup>
                  <Stat>
                    <StatLabel>🔴 High Priority</StatLabel>
                    <StatNumber>{outgoingStats.queueSizes.high}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>🟡 Normal Priority</StatLabel>
                    <StatNumber>{outgoingStats.queueSizes.normal}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>🟢 Low Priority</StatLabel>
                    <StatNumber>{outgoingStats.queueSizes.low}</StatNumber>
                  </Stat>
                </StatGroup>
              )}
            </CardBody>
          </Card>

          {/* Actions Card */}
          <Card variant="outline">
            <CardHeader>
              <Flex align="center" gap={2}>
                <FiSettings size={20} />
                <StatLabel>Quick Actions</StatLabel>
              </Flex>
            </CardHeader>
            <CardBody>
              <VStack gap={3} align="stretch">
                <Button 
                  colorScheme="red" 
                  variant="outline"
                  onClick={async () => {
                    if (window.confirm('Yakin ingin clear semua antrian?')) {
                      await apiClient.post('/admin/telegram/callback-queue-clear');
                      fetchData();
                    }
                  }}
                >
                  Clear Incoming Queue
                </Button>
                <Button 
                  colorScheme="blue" 
                  variant="outline"
                  onClick={() => {/* Navigate to test broadcast */}}
                >
                  Test Broadcast
                </Button>
                <Button 
                  colorScheme="green" 
                  variant="outline"
                  onClick={async () => {
                    const res = await apiClient.post('/settings/generate-schedule');
                    alert(res.data.message);
                  }}
                >
                  Generate Schedule Now
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {error && (
          <Alert status="error" mt={4}>
            {error}
          </Alert>
        )}

        {/* Health Alerts */}
        {(!isOutgoingHealthy || !isIncomingHealthy) && (
          <Alert status="warning" mt={4}>
            <Flex align="center" gap={2}>
              <AlertIcon />
              <Box>
                {outgoingStats && !isOutgoingHealthy && (
                  <Text>Outgoing queue tinggi ({outgoingStats.currentQueueSize} pending). 
                    Pertimbangkan turunkan TELEGRAM_BATCH_SIZE atau tambah worker.</Text>
                )}
                {incomingStats && !isIncomingHealthy && (
                  <Text>Incoming queue tinggi ({incomingStats.currentQueueSize} pending). 
                    DB mungkin lambat, cek koneksi database.</Text>
                )}
              </Box>
            </Flex>
          </Alert>
        )}
      </CardBody>
    </Card>
  );
};

export default TelegramStatusDashboard;
```

#### 2. Settings Panel - Dual Scheduling Mode

```tsx
import React, { useState, useEffect } from 'react';
import { 
  Card, CardHeader, CardBody, CardFooter,
  Heading, FormControl, FormLabel, Select, Input, Button, 
  FormHelperText, Switch, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText
} from '@chakra-ui/react';

interface AutomatedConfig {
  questionsPerDay: number;
  startHour: number;
  endHour: number;
  timezone: string;
  minIntervalMinutes: number;
  maxQuestionsPerBatch: number;
}

const SchedulingSettings: React.FC = () => {
  const [mode, setMode] = useState<'manual' | 'automated'>('manual');
  const [config, setConfig] = useState<AutomatedConfig>({
    questionsPerDay: 20,
    startHour: 8,
    endHour: 20,
    timezone: 'Asia/Jakarta',
    minIntervalMinutes: 30,
    maxQuestionsPerBatch: 3
  });
  const [previewSchedule, setPreviewSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [modeRes, configRes] = await Promise.all([
        apiClient.get('/admin/settings/scheduling-mode'),
        apiClient.get('/admin/settings/automated-config')
      ]);
      setMode(modeRes.data.data.mode);
      setConfig(configRes.data.data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleModeChange = async (newMode: 'manual' | 'automated') => {
    try {
      await apiClient.put('/admin/settings/scheduling-mode', { mode: newMode });
      setMode(newMode);
      
      if (newMode === 'automated') {
        const res = await apiClient.get('/admin/settings/preview-schedule');
        setPreviewSchedule(res.data.data?.schedule || []);
      }
    } catch (err) {
      console.error('Failed to change mode:', err);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      await apiClient.put('/admin/settings/automated-config', config);
      alert('Config saved!');
      
      // Refresh preview
      const res = await apiClient.get('/admin/settings/preview-schedule');
      setPreviewSchedule(res.data.data?.schedule || []);
    } catch (err) {
      console.error('Failed to save config:', err);
      alert('Gagal save config');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    try {
      setLoading(true);
      const res = await apiClient.post('/admin/settings/generate-schedule');
      alert(res.data.message);
      setPreviewSchedule(res.data.schedule || []);
    } catch (err) {
      console.error('Failed to generate:', err);
      alert('Gagal generate schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Scheduling Configuration</Heading>
      </CardHeader>
      
      <CardBody>
        {/* Mode Toggle */}
        <FormControl mb={6}>
          <FormLabel>Scheduling Mode</FormLabel>
          <Select 
            value={mode} 
            onChange={(e) => handleModeChange(e.target.value as any)}
          >
            <option value="manual">Manual - Admin atur jadwal per pertanyaan</option>
            <option value="automated">Automated - Sistem sebar jadwal otomatis</option>
          </Select>
          <FormHelperText>
            {mode === 'manual' 
              ? 'Set scheduled_time secara manual di halaman pertanyaan'
              : 'Sistem akan otomatis sebar jadwal ke semua pertanyaan aktif'
            }
          </FormHelperText>
        </FormControl>

        {/* Automated Config (only when automated mode) */}
        {mode === 'automated' && (
          <>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={6}>
              <FormControl>
                <FormLabel>Pertanyaan per Hari</FormLabel>
                <Input 
                  type="number" 
                  min={1} 
                  max={50}
                  value={config.questionsPerDay}
                  onChange={(e) => setConfig({...config, questionsPerDay: parseInt(e.target.value)})}
                />
                <FormHelperText>1-50 pertanyaan per hari (rekomendasi: 20)</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Mulai Jam (WIB)</FormLabel>
                <Input 
                  type="number" 
                  min={0} 
                  max={23}
                  value={config.startHour}
                  onChange={(e) => setConfig({...config, startHour: parseInt(e.target.value)})}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Selesai Jam (WIB)</FormLabel>
                <Input 
                  type="number" 
                  min={0} 
                  max={23}
                  value={config.endHour}
                  onChange={(e) => setConfig({...config, endHour: parseInt(e.target.value)})}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Minimum Interval (menit)</FormLabel>
                <Input 
                  type="number" 
                  min={15}
                  value={config.minIntervalMinutes}
                  onChange={(e) => setConfig({...config, minIntervalMinutes: parseInt(e.target.value)})}
                />
                <FormHelperText>Minimal 15 menit antar pertanyaan</FormHelperText>
              </FormControl>
            </SimpleGrid>

            <Button 
              colorScheme="blue" 
              mr={3}
              onClick={handleSaveConfig}
              isLoading={loading}
            >
              Save Configuration
            </Button>
            
            <Button 
              colorScheme="green" 
              variant="outline"
              onClick={handleGenerateSchedule}
              isLoading={loading}
            >
              Generate Schedule Now
            </Button>
          </>
        )}

        {/* Preview Schedule */}
        {mode === 'automated' && previewSchedule.length > 0 && (
          <Card mt={6} variant="outline">
            <CardHeader>
              <Heading size="sm">Preview Jadwal Hari Ini</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={2} gap={4}>
                {previewSchedule.slice(0, 10).map((item, idx) => (
                  <Stat key={idx}>
                    <StatLabel>Pertanyaan #{item.question_id}</StatLabel>
                    <StatNumber>{item.scheduled_time}</StatNumber>
                    <StatHelpText>
                      {item.question_text.substring(0, 40)}...
                    </StatHelpText>
                  </Stat>
                ))}
                {previewSchedule.length > 10 && (
                  <Stat>
                    <StatLabel>+{previewSchedule.length - 10} lagi</StatLabel>
                  </Stat>
                )}
              </SimpleGrid>
            </CardBody>
          </Card>
        )}
      </CardBody>
    </Card>
  );
};

export default SchedulingSettings;
```

#### 3. Test Broadcast Modal

```tsx
import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Input, Textarea, FormHelperText,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react';

interface TestBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TestBroadcastModal: React.FC<TestBroadcastModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [count, setCount] = useState(10);
  const [message, setMessage] = useState('Test pesan dari admin panel');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await apiClient.post('/admin/telegram/test-broadcast', { count, message });
      setResult(res.data);
      onSuccess?.();
    } catch (err) {
      console.error('Broadcast failed:', err);
      setResult({ success: false, message: 'Gagal mengirim' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Test Broadcast (Rate Limit Test)</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>Jumlah User</FormLabel>
            <NumberInput
              value={count}
              min={1}
              max={200}
              onChange={(_, val) => setCount(val ? parseInt(val) : 1)}
            >
              <NumberInputField />
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInput>
            <FormHelperText>Uji coba ke {count} user pertama</FormHelperText>
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Pesan</FormLabel>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </FormControl>

          {result && (
            <Alert status={result.success ? 'success' : 'error'} mt={4}>
              {result.message}
              {result.queued && <Text>Queued: {result.queued}</Text>}
            </Alert>
          )}
        </ModalBody>

        <ModalFooter>
          <Button 
            colorScheme="blue" 
            mr={3} 
            onClick={handleSubmit}
            isLoading={loading}
          >
            Send Test
          </Button>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TestBroadcastModal;
```

---

## 📊 Alert Thresholds (Saran Frontend)

| Metric | Normal | Warning | Critical |
|--------|--------|---------|----------|
| **Outgoing Queue** | < 50 | 50-200 | > 200 |
| **Incoming Queue** | < 100 | 100-500 | > 500 |
| **Rate Limited Count** | < 5/min | 5-20/min | > 20/min |
| **Failed Messages** | 0 | 1-5 | > 5 |
| **Avg Processing Time** | < 100ms | 100-500ms | > 500ms |

---

## 🔄 Polling Intervals (Rekomendasi)

| Component | Polling Interval | Reason |
|-----------|-----------------|--------|
| TelegramStatusDashboard | 5 detik | Real-time monitoring kritikal |
| SchedulingSettings | 30 detik | Config tidak sering berubah |
| Health alerts | 10 detik | Balance antara responsif & load |
| Manual schedule trigger | On-demand | User-initiated |

### React Hook untuk Polling
```tsx
function usePolling<T>(url: string, intervalMs: number = 5000): { data: T | null, loading: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        const res = await apiClient.get(url);
        if (mounted) {
          setData(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, intervalMs);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [url, intervalMs]);

  return { data, loading };
}

// Usage
const { data: queueStats } = usePolling<QueueStats>('/admin/telegram/queue-stats', 5000);
```

---

## 🚨 Emergency Procedures (Frontend)

### 1. Queue Overflow
```tsx
// Jika queue > 1000
<Button 
  colorScheme="red" 
  onClick={async () => {
    const confirmed = window.confirm(
      `Queue size: ${stats.currentQueueSize}\n` +
      'Yakin ingin clear antrian? Pesan yang belum terkirim akan hilang.'
    );
    if (confirmed) {
      await apiClient.post('/admin/telegram/callback-queue-clear');
      // Refresh stats
    }
  }}
>
  Emergency Clear Queue
</Button>
```

### 2. Rate Limit Spike
```tsx
// Jika totalRateLimited naik tiba-tiba
<Alert status="error">
  <AlertIcon />
  <Box>
    <Text fontWeight="bold">⚠️ Rate Limit Spike Detected</Text>
    <Text>Telegram API sedang membatasi permintaan</Text>
    <Button size="sm" onClick={() => window.location.reload()}>
      Restart Service
    </Button>
  </Box>
</Alert>
```

---

## 📝 Changelog

| Versi | Tanggal | Fitur |
|-------|---------|-------|
| 1.0 | 2025-10-01 | Rate limiter keluar, message queue, monitoring endpoints |
| 2.0 | 2026-10-02 | Rate limiter masuk, dual scheduling, settings API, emergency clear |

---

## 🆘 Support

Jika ada error:
1. Cek dashboard monitoring (queue size, rate limit, processing time)
2. Cek `/error-log` endpoint di backend
3. Hubungi backend team via #telegram-bot channel

**Dokumen ini adalah panduan lengkap untuk tim frontend mengintegrasikan semua fitur rate limiting, queue monitoring, dan dual scheduling mode ke UI admin panel.**