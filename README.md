# 孤島販售登記系統 v1

## 功能

- 獨立網址，不放官網導覽列
- 顧客 PIN：1688
- Admin PIN：2025
- 最多登記 5 項商品與金額
- 自動計算總額
- 備註欄
- Admin 查詢、統計、刪除、匯出 CSV
- 資料保存在同一台裝置、同一瀏覽器的 localStorage

## 上傳至 GitHub Pages

將以下三個檔案上傳至 Repository 根目錄：

- sales-registration.html
- sales-registration.css
- sales-registration.js

不需要加入任何導覽列。

頁面網址：

`https://你的GitHubPages網址/sales-registration.html`

## 修改 PIN

在 `sales-registration.js` 最上方修改：

- `CUSTOMER_PIN = "1688"`
- `ADMIN_PIN = "2025"`

修改 JS 後，將 HTML 內的 `sales-registration.js?v=1` 改成 `?v=2`，避免瀏覽器快取。

## 重要限制

目前為簡易靜態版本。PIN 寫在前端，只能防止一般誤入，不能視為高安全性登入。資料僅保存在目前瀏覽器，換裝置、換瀏覽器或清除網站資料後，紀錄不會同步或可能消失。每次活動結束請由 Admin 匯出 CSV 備份。
