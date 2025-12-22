// src/utils/errorHandler.ts
export class AIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string,
  ) {
    super(message);
    this.name = "AIError";
  }
}

export const handleAIError = (error: any) => {
  // Check for billing suspension message specifically
  if (
    error?.message &&
    (error.message.includes("Outstanding invoices") ||
      error.message.includes("AI Service Suspended"))
  ) {
    console.error("AI Billing Error:", error.message);
    alert(
      "⚠️ AI Service Suspended / บริการ AI ถูกระงับ\n\n" +
        "[EN] The AI provider (OpenAI) has rejected the request due to outstanding invoices.\n" +
        "Please check your billing details at platform.openai.com/account/billing\n\n" +
        "[TH] ผู้ให้บริการ AI (OpenAI) ปฏิเสธคำขอเนื่องจากมียอดค้างชำระ\n" +
        "กรุณาตรวจสอบข้อมูลการชำระเงินที่ platform.openai.com/account/billing",
    );
    return;
  }

  if (error instanceof AIError) {
    console.error(`AI Service Error [${error.statusCode}]: ${error.message}`);

    switch (error.statusCode) {
      case 401:
        // Redirect to login
        window.location.href = "/login";
        break;
      case 403:
        // Show permission denied message
        alert("You do not have permission to access this feature");
        break;
      case 500:
        // Show server error message
        alert("Server error. Please try again later.");
        break;
      default:
        alert(`Error: ${error.message}`);
    }
  } else {
    console.error("Unexpected error:", error);
    alert(error?.message || "An unexpected error occurred");
  }
};
