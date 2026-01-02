import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Dot } from "recharts";
import { Badge } from "@/components/ui/badge";

interface SleepData {
  date: string;
  sleep_duration_hours: number;
  sleep_score: number;
  sleep_quality: "excellent" | "good" | "fair" | "poor" | "very_poor";
  sleep_efficiency_percentage: number;
}

interface SleepChartProps {
  title: string;
  description?: string;
  data: SleepData[];
  isLoading?: boolean;
}

// ฟังก์ชันสำหรับแปลงวันที่เป็นชื่อวัน
const formatDateToDayName = (dateString: string) => {
  const date = new Date(dateString);
  const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];
  return days[date.getDay() === 0 ? 6 : date.getDay() - 1];
};

// ฟังก์ชันสำหรับกำหนดสีตามคุณภาพการนอน
const getSleepQualityColor = (quality: string) => {
  switch (quality) {
    case "excellent":
      return "#10b981"; // green-500
    case "good":
      return "#3b82f6"; // blue-500
    case "fair":
      return "#f59e0b"; // amber-500
    case "poor":
      return "#f97316"; // orange-500
    case "very_poor":
      return "#ef4444"; // red-500
    default:
      return "#6b7280"; // gray-500
  }
};

// ฟังก์ชันสำหรับกำหนดสีพื้นหลังตามคุณภาพการนอน
const getSleepQualityBgColor = (quality: string) => {
  switch (quality) {
    case "excellent":
      return "bg-green-100 text-green-800";
    case "good":
      return "bg-blue-100 text-blue-800";
    case "fair":
      return "bg-amber-100 text-amber-800";
    case "poor":
      return "bg-orange-100 text-orange-800";
    case "very_poor":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// ฟังก์ชันสำหรับแปลคุณภาพการนอนเป็นภาษาไทย
const translateSleepQuality = (quality: string) => {
  switch (quality) {
    case "excellent":
      return "ยอดเยี่ยม";
    case "good":
      return "ดี";
    case "fair":
      return "ปานกลาง";
    case "poor":
      return "แย่";
    case "very_poor":
      return "แย่มาก";
    default:
      return "ไม่ระบุ";
  }
};

// Custom Dot component สำหรับแสดงสีตามคุณภาพการนอน
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload || !payload.sleep_quality) return null;
  
  const color = getSleepQualityColor(payload.sleep_quality);
  
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

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isRealData = data.sleep_duration_hours > 0 && data.sleep_score > 0;
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">ชั่วโมงการนอน:</span>
            <span className="font-medium">{data.sleep_duration_hours.toFixed(1)} ชั่วโมง</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">คุณภาพ:</span>
            <Badge className={getSleepQualityBgColor(data.sleep_quality)}>
              {translateSleepQuality(data.sleep_quality)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">ประสิทธิภาพ:</span>
            <span className="font-medium">{data.sleep_efficiency_percentage}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">คะแนน:</span>
            <span className="font-medium">{data.sleep_score}/100</span>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">สถานะ:</span>
              <Badge 
                variant={isRealData ? "default" : "secondary"}
                className="text-xs"
              >
                {isRealData ? "ข้อมูลจริง" : "ข้อมูลตัวอย่าง"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function SleepChart({ 
  title, 
  description, 
  data, 
  isLoading = false 
}: SleepChartProps) {
  // แปลงข้อมูลให้เหมาะสมกับกราฟ
  const chartData = data.map(item => ({
    name: formatDateToDayName(item.date),
    value: item.sleep_duration_hours,
    sleep_duration_hours: item.sleep_duration_hours,
    sleep_quality: item.sleep_quality,
    sleep_efficiency_percentage: item.sleep_efficiency_percentage,
    sleep_score: item.sleep_score,
    date: item.date
  }));

  // สีหลักของกราฟ (สีสบายตา)
  const primaryColor = "#6366f1"; // indigo-500

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">ไม่มีข้อมูลการนอนหลับ</p>
              <p className="text-xs text-gray-400 mt-1">กรุณาเพิ่มข้อมูลการนอนหลับ</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="health-stat-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span>{title}</span>
          <Badge variant="outline" className="text-xs">
            {data.length} วัน
          </Badge>
          <Badge 
            variant={data.some(item => item.sleep_duration_hours > 0) ? "default" : "secondary"}
            className="text-xs"
          >
            {data.some(item => item.sleep_duration_hours > 0) ? "ข้อมูลจริง" : "ข้อมูลตัวอย่าง"}
          </Badge>
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                domain={[0, 12]}
                tickFormatter={(value) => `${value}ชม.`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={primaryColor}
                strokeWidth={3}
                dot={{ r: 6, fill: primaryColor, stroke: primaryColor, strokeWidth: 1 }}
                activeDot={{ r: 8, fill: primaryColor, stroke: primaryColor, strokeWidth: 1 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend สำหรับคุณภาพการนอน */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-600 mb-2">คุณภาพการนอน:</p>
          <div className="flex flex-wrap gap-2">
            {["excellent", "good", "fair", "poor", "very_poor"].map((quality) => (
              <div key={quality} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getSleepQualityColor(quality) }}
                />
                <span className="text-xs text-gray-600">{translateSleepQuality(quality)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
