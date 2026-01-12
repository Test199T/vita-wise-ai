import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import {
    MessageSquare,
    Users,
    TrendingUp,
    Calendar,
    ArrowLeft,
    Loader2,
    BarChart3,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsStore } from "@/store/chat-analytics-store";

export default function ChatAnalytics() {
    const navigate = useNavigate();
    const {
        usage,
        topics,
        isLoadingUsage,
        isLoadingTopics,
        usageError,
        topicsError,
        fetchUsage,
        fetchTopics,
    } = useAnalyticsStore();

    useEffect(() => {
        fetchUsage(30);
        fetchTopics(10);
    }, [fetchUsage, fetchTopics]);

    const handleRefresh = () => {
        fetchUsage(30);
        fetchTopics(10);
    };

    // Format date for chart
    const formatChartData = (trends: { date: string; count: number }[]) => {
        return trends.map((t) => ({
            date: new Date(t.date).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
            }),
            count: t.count,
        }));
    };

    const isLoading = isLoadingUsage || isLoadingTopics;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/chat")}
                        >
                            <ArrowLeft className="size-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold flex items-center gap-2">
                                <BarChart3 className="size-5 text-primary" />
                                Chat Analytics
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                สถิติการใช้งานแชท 30 วันล่าสุด
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        รีเฟรช
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                ข้อความทั้งหมด
                            </CardTitle>
                            <MessageSquare className="size-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            {isLoadingUsage ? (
                                <Loader2 className="size-6 animate-spin" />
                            ) : (
                                <>
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {usage?.overview.totalMessages.toLocaleString() ?? "-"}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        ผู้ใช้: {usage?.overview.userMessages ?? 0} | AI: {usage?.overview.aiMessages ?? 0}
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                จำนวนเซสชัน
                            </CardTitle>
                            <Users className="size-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            {isLoadingUsage ? (
                                <Loader2 className="size-6 animate-spin" />
                            ) : (
                                <>
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {usage?.overview.totalSessions.toLocaleString() ?? "-"}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        การสนทนาทั้งหมด
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                เฉลี่ยต่อเซสชัน
                            </CardTitle>
                            <TrendingUp className="size-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            {isLoadingUsage ? (
                                <Loader2 className="size-6 animate-spin" />
                            ) : (
                                <>
                                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                        {usage?.overview.averageMessagesPerSession.toFixed(1) ?? "-"}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        ข้อความ / เซสชัน
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                ช่วงเวลา
                            </CardTitle>
                            <Calendar className="size-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            {isLoadingUsage ? (
                                <Loader2 className="size-6 animate-spin" />
                            ) : (
                                <>
                                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                        {usage?.period.days ?? 30} วัน
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        ข้อมูลย้อนหลัง
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Trends Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="size-5 text-primary" />
                                แนวโน้มการใช้งานรายวัน
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingUsage ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : usageError ? (
                                <div className="h-[300px] flex items-center justify-center text-destructive">
                                    {usageError}
                                </div>
                            ) : usage?.trends && usage.trends.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={formatChartData(usage.trends)}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12 }}
                                            className="text-muted-foreground"
                                        />
                                        <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--background))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            dot={{ fill: "hsl(var(--primary))", strokeWidth: 0 }}
                                            activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                    ไม่มีข้อมูล
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Topics Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="size-5 text-primary" />
                                หัวข้อยอดนิยม
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingTopics ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : topicsError ? (
                                <div className="h-[300px] flex items-center justify-center text-destructive">
                                    {topicsError}
                                </div>
                            ) : topics?.topics && topics.topics.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={topics.topics}
                                        layout="vertical"
                                        margin={{ left: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis type="number" tick={{ fontSize: 12 }} />
                                        <YAxis
                                            type="category"
                                            dataKey="topic"
                                            tick={{ fontSize: 12 }}
                                            width={80}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--background))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="hsl(var(--primary))"
                                            radius={[0, 4, 4, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                    ไม่มีข้อมูล
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Sessions */}
                {usage?.recentSessions && usage.recentSessions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="size-5 text-primary" />
                                เซสชันล่าสุด
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {usage.recentSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                                        onClick={() => navigate(`/chat/${session.id}`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <MessageSquare className="size-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{session.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {session.messageCount} ข้อความ
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(session.lastActivity).toLocaleDateString("th-TH", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
