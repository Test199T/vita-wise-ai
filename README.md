# VITA WISE AI - แอปสุขภาพอัจฉริยะ

## การใช้งาน Markdown ใน AI Response

### ตารางสุขภาพ
AI สามารถส่งข้อความในรูปแบบ Markdown เพื่อแสดงตารางที่สวยงามได้ เช่น:

```markdown
| หมวดหมู่ | ตัวอย่างอาหาร | จำนวนต่อวัน | เคล็ดลับเพิ่มเติม |
|----------|---------------|-------------|------------------|
| **ผักสด** | ผักโขม, บรอกโคลี, แครอท | 2-3 ถ้วย | เลือกผักที่สดและหลากหลาย |
| **ผลไม้** | แอปเปิ้ล, กล้วย, ส้ม | 1-2 ถ้วย | ทานผลไม้สดเป็นของว่าง |
| **ธัญพืช** | ข้าวกล้อง, ข้าวโอ๊ต | 6-8 ส่วน | เลือกผลิตภัณฑ์ที่ไม่ขัดสี |
```

### รายการและข้อความ
- **รายการแบบมีจุด**: ใช้ `-` หรือ `*`
- **รายการแบบมีตัวเลข**: ใช้ `1.`, `2.`, `3.`
- **ข้อความหนา**: ใช้ `**ข้อความ**`
- **ข้อความเอียง**: ใช้ `*ข้อความ*`
- **โค้ด**: ใช้ `` `โค้ด` ``

### ตัวอย่างการใช้งาน
เมื่อ AI ส่งข้อความมาในรูปแบบ Markdown หน้าบ้านจะแสดงผลได้สวยงามโดยอัตโนมัติ รวมถึง:
- ตารางที่มีการจัดรูปแบบ
- รายการที่มีการจัดเรียง
- ข้อความที่มีการเน้น
- โค้ดที่มีการไฮไลท์

## การติดตั้งและใช้งาน

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ba49c0bd-27cd-40c5-a656-b1864e504d00) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ba49c0bd-27cd-40c5-a656-b1864e504d00) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
