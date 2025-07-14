import type React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ChartData {
  name: string
  value: number
}

interface DashboardChartsProps {
  data: ChartData[]
  title: string
  dataKey: string
  color: string
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ data, title, dataKey, color }) => {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataKey} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DashboardCharts
