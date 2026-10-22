# Amp — กรมบริการขัดใจ

เว็บไซต์สแตติกที่มี 8 หมวดและ 32 ด่าน แต่ละหมวดมีฉากและกติกาของตัวเอง

## เพิ่มหรือแก้คอนเทนต์

- `dist/content.js` เก็บชื่อหมวด คำโปรย ชื่อด่าน โจทย์ คำใบ้ มุก และฉากจบ
- `dist/experiences.js` เก็บฉากและกติกาของแต่ละหมวด แยกเป็นฟังก์ชันตาม `id` ของหมวด แล้วลงทะเบียนใน `experiences`
- `dist/experiences.css` เก็บหน้าตาเฉพาะของแต่ละหมวดในคลาส `.ex-<id>`
- `dist/app.js` จัดการหน้ารวม เส้นทาง ความคืบหน้า คำใบ้ และการผ่านด่าน

หมวดใหม่ต้องมี 4 ด่านและ 4 คำใบ้ พร้อมฟังก์ชันฉากที่รองรับด่าน 0–3 ปัจจุบันความคืบหน้าบันทึกใน `localStorage` ภายใต้ `amp-progress-v1`; อย่าเปลี่ยนคีย์นี้หากต้องการเก็บความคืบหน้าของผู้เล่นเดิม

รันพรีวิวด้วย `python3 -m http.server 4173 --directory dist` จากโฟลเดอร์นี้

## เผยแพร่บน GitHub Pages

โฟลเดอร์ `amp-site` นี้เป็น Git repo และไฟล์เว็บไซต์ที่เผยแพร่อยู่ใน `dist/` ส่วน `.github/workflows/pages.yml` จะเผยแพร่ไฟล์ใน `dist/` ทุกครั้งที่ push ไปที่ `main`

1. สร้าง repository ใหม่บน GitHub โดยไม่ต้องเพิ่ม README หรือไฟล์เริ่มต้น
2. เพิ่ม remote และ push จากโฟลเดอร์ `amp-site`:

   ```sh
   git remote add origin https://github.com/USERNAME/REPOSITORY.git
   git push -u origin main
   ```

3. ที่ repository บน GitHub เปิด **Settings → Pages → Build and deployment** แล้วเลือก **GitHub Actions** เป็น Source

เมื่อ workflow ทำงานสำเร็จ เว็บไซต์จะอยู่ที่ `https://USERNAME.github.io/REPOSITORY/` (หรือโดเมนที่ตั้งไว้ใน Pages) เส้นทางและไฟล์ asset ของเว็บใช้ URL แบบสัมพัทธ์ จึงใช้งานได้ใน repository ที่มีชื่อใดก็ได้
