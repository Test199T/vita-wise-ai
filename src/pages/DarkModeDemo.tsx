import { MainLayout } from "@/components/layout/MainLayout";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Palette, Zap } from "lucide-react";

export default function DarkModeDemo() {
    return (
        <MainLayout>
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <Sparkles className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">Dark Mode Toggle</h1>
                    </div>
                    <p className="text-muted-foreground">
                        สลับระหว่างโหมดสว่างและโหมดมืดได้ง่ายๆ เพียงคลิกเดียว!
                    </p>
                </div>

                {/* Toggle Button */}
                <div className="flex justify-center">
                    <Card className="w-fit">
                        <CardHeader className="text-center">
                            <CardTitle className="text-lg">เปลี่ยนธีม</CardTitle>
                            <CardDescription>
                                กดไอคอนเพื่อสลับธีม
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center pb-6">
                            <DarkModeToggle />
                        </CardContent>
                    </Card>
                </div>

                {/* Demo Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                คุณสมบัติ
                            </CardTitle>
                            <CardDescription>
                                สิ่งที่ยอดเยี่ยมของ Dark Mode
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-start gap-2">
                                <Badge variant="outline">✨</Badge>
                                <p className="text-sm">ไอคอนมีแอนิเมชั่น</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Badge variant="outline">⚡</Badge>
                                <p className="text-sm">เปลี่ยนได้ทันที ไม่ต้องรีโหลด</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Badge variant="outline">💾</Badge>
                                <p className="text-sm">จำค่าได้แม้ปิดเบราว์เซอร์</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                ทำงานอย่างไร?
                            </CardTitle>
                            <CardDescription>
                                เทคโนโลยีที่ใช้
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-start gap-2">
                                <Badge>1</Badge>
                                <p className="text-sm">เก็บค่าใน localStorage</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Badge>2</Badge>
                                <p className="text-sm">ใช้ CSS class "dark"</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Badge>3</Badge>
                                <p className="text-sm">Tailwind แปลงสีอัตโนมัติ</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sample Content to Show Theme */}
                <Card>
                    <CardHeader>
                        <CardTitle>ตัวอย่างเนื้อหา</CardTitle>
                        <CardDescription>
                            ดูว่าโหมดมืดเปลี่ยนสีอย่างไร
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-foreground">
                            นี่คือข้อความปกติ จะเปลี่ยนสีตามธีมที่เลือก
                        </p>
                        <p className="text-muted-foreground">
                            นี่คือข้อความรอง (muted) สีจะอ่อนลงเล็กน้อย
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            <Button>ปุ่มปกติ</Button>
                            <Button variant="outline">ปุ่ม Outline</Button>
                            <Button variant="secondary">ปุ่ม Secondary</Button>
                            <Button variant="destructive">ปุ่ม Destructive</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
