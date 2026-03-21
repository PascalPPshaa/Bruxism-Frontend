import { useEffect, useState } from 'react'
import { getPatients } from '../lib/api'
import { Patient } from '@/types/database'

export default function PatientsPage() {
  const [data, setData] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPatients()
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Data Pasien</h1>
      {data.map((p, i) => (
        <div key={i}>{p.phone}</div>
      ))}
    </div>
  )
}
