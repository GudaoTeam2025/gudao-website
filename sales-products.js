/*
  當次販售商品資料表
  請在每次出攤前維護此檔案。

  欄位：
  id       唯一代碼，不可重複
  name     顧客看到的商品名稱
  price    自動帶入的金額，只填數字
  active   true 顯示，false 暫時隱藏
*/
window.GUDAO_SALE_PRODUCTS = [
  { id: "AGV-001", name: "範例植株 A", price: 1200, active: true },
  { id: "AGV-002", name: "範例植株 B", price: 1800, active: true },
  { id: "MED-001", name: "孤島介質", price: 350, active: true },
  { id: "POT-001", name: "孤島盆器", price: 500, active: false }
];
