import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip, Dot } from "recharts";
import { Badge } from "@/components/ui/badge";

interface EnhancedHealthChartProps {
  title: string;
  description?: string;
  data: Array<{
    name: string;
    value: number;
    [key: string]: any;
  }>;
  type?: "line" | "bar";
  color?: string;
  unit?: string;
  isLoading?: boolean;
  showDataStatus?: boolean;
}

// Custom Tooltip component สำหรับกราฟทั่วไป
const CustomTooltip = ({ active, payload, label, unit = "" }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;

    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">ค่า:</span>
            <span className="font-medium">{value.toFixed(1)} {unit}</span>
          </div>

          {/* แสดงข้อมูลเพิ่มเติมถ้ามี */}
          {data.date && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">วันที่:</span>
              <span className="font-medium">{data.date}</span>
            </div>
          )}

          {data.type && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">ประเภท:</span>
              <Badge variant="outline" className="text-xs">
                {data.type}
              </Badge>
            </div>
          )}

          {data.quality && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">คุณภาพ:</span>
              <Badge
                variant="outline"
                className={`text-xs ${data.quality === 'excellent' ? 'bg-green-100 text-green-800' :
                    data.quality === 'good' ? 'bg-blue-100 text-blue-800' :
                      data.quality === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                        data.quality === 'poor' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                  }`}
              >
                {data.quality === 'excellent' ? 'ยอดเยี่ยม' :
                  data.quality === 'good' ? 'ดี' :
                    data.quality === 'fair' ? 'ปานกลาง' :
                      data.quality === 'poor' ? 'แย่' : 'แย่มาก'}
              </Badge>
            </div>
          )}

          {data.efficiency && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">ประสิทธิภาพ:</span>
              <span className="font-medium">{data.efficiency}%</span>
            </div>
          )}

          {data.score && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">คะแนน:</span>
              <span className="font-medium">{data.score}/100</span>
            </div>
          )}

          {/* แสดงสถานะข้อมูลถ้าเปิดใช้งาน */}
          {data.isRealData !== undefined && (
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">สถานะ:</span>
                <Badge
                  variant={data.isRealData ? "default" : "secondary"}
                  className="text-xs"
                >
                  {data.isRealData ? "ข้อมูลจริง" : "ข้อมูลตัวอย่าง"}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Dot component สำหรับแสดงสีตามข้อมูล
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload) return null;

  // กำหนดสีตามคุณภาพหรือประเภทข้อมูล
  let color = props.fill || "#6366f1";

  if (payload.quality) {
    switch (payload.quality) {
      case "excellent":
        color = "#10b981";
        break;
      case "good":
        color = "#3b82f6";
        break;
      case "fair":
        color = "#f59e0b";
        break;
      case "poor":
        color = "#f97316";
        break;
      case "very_poor":
        color = "#ef4444";
        break;
    }
  } else if (payload.type) {
    switch (payload.type) {
      case "บริโภค":
        color = "#f59e0b";
        break;
      case "เผาผลาญ":
        color = "#ef4444";
        break;
      default:
        color = props.fill || "#6366f1";
    }
  }

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={6}
      fill={color}
      stroke={color}
      strokeWidth={1}
    />
  );
};

export function EnhancedHealthChart({
  title,
  description,
  data,
  type = "line",
  color = "#6366f1",
  unit = "",
  isLoading = false,
  showDataStatus = false
}: EnhancedHealthChartProps) {
  // ตรวจสอบว่ามีข้อมูลจริงหรือไม่
  const hasRealData = data.some(item => item.value > 0);

  if (isLoading) {
    return (
      <Card className="health-stat-card">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="health-stat-card">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">ไม่มีข้อมูล</p>
              <p className="text-xs text-gray-400 mt-1">กรุณาเพิ่มข้อมูล</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="health-stat-card">
      <CardHeader>
        <CardTitle className="text-lg flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <span>{title}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {data.length} รายการ
            </Badge>
            {showDataStatus && (
              <Badge
                variant={hasRealData ? "default" : "secondary"}
                className="text-xs"
              >
                {hasRealData ? "ข้อมูลจริง" : "ข้อมูลตัวอย่าง"}
              </Badge>
            )}
          </div>
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {type === "line" ? (
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}${unit}`}
                />
                <Tooltip content={<CustomTooltip unit={unit} />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={3}
                  dot={{ r: 6, fill: color, stroke: color, strokeWidth: 1 }}
                  activeDot={{ r: 8, fill: color, stroke: color, strokeWidth: 1 }}
                  connectNulls={false}
                />
              </LineChart>
            ) : (
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}${unit}`}
                />
                <Tooltip content={<CustomTooltip unit={unit} />} />
                <Bar
                  dataKey="value"
                  fill={color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend สำหรับข้อมูลที่มีประเภทหรือคุณภาพ */}
        {(data.some(item => item.type) || data.some(item => item.quality)) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-600 mb-2">คำอธิบาย:</p>
            <div className="flex flex-wrap gap-2">
              {data.some(item => item.type) && (
                <>
                  {data.find(item => item.type === 'บริโภค') && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-xs text-gray-600">บริโภค</span>
                    </div>
                  )}
                  {data.find(item => item.type === 'เผาผลาญ') && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-xs text-gray-600">เผาผลาญ</span>
                    </div>
                  )}
                </>
              )}
              {data.some(item => item.quality) && (
                <>
                  {['excellent', 'good', 'fair', 'poor', 'very_poor'].map((quality) => {
                    if (!data.some(item => item.quality === quality)) return null;
                    const colors = {
                      excellent: '#10b981',
                      good: '#3b82f6',
                      fair: '#f59e0b',
                      poor: '#f97316',
                      very_poor: '#ef4444'
                    };
                    const labels = {
                      excellent: 'ยอดเยี่ยม',
                      good: 'ดี',
                      fair: 'ปานกลาง',
                      poor: 'แย่',
                      very_poor: 'แย่มาก'
                    };
                    return (
                      <div key={quality} className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors[quality as keyof typeof colors] }}
                        />
                        <span className="text-xs text-gray-600">{labels[quality as keyof typeof labels]}</span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
