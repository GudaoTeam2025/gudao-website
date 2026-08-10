/*
  周邊商品資料
  圖片比例：1080 x 1400（27:35）
  圖片資料夾：images/merchandise/

  新增商品：複製一整組 { ... }，修改內容與圖片路徑。
  images 可放多張，頁面會自動產生滑動與切換按鈕。
*/
window.GUDAO_MERCHANDISE = [
  {
    code: "GDM-001",
    category: "CULTIVATION GOODS",
    name: "孤島介質",
    subtitle: "為龍舌蘭培育日常準備的孤島介質",
    status: "商品介紹",
    description: "此處可填寫孤島介質的正式定位、特色、包裝內容與適用情境。配方、粒徑、容量與使用方式請依實際商品資料更新。",
    highlights: [
      "商品特色待補充",
      "容量與規格待補充",
      "建議使用方式待補充"
    ],
    images: [
      "images/merchandise/medium/medium-001.jpg",
      "images/merchandise/medium/medium-002.jpg",
      "images/merchandise/medium/medium-003.jpg"
    ],
    link: "https://www.instagram.com/gudao.team/",
    linkText: "Instagram 私訊了解"
  }

  /* 未來新增範例：
  ,{
    code: "GDM-002",
    category: "GUDAO WEAR",
    name: "孤島 T恤",
    subtitle: "孤島品牌服飾",
    status: "COMING SOON",
    description: "填寫材質、版型、尺寸與設計說明。",
    highlights: ["材質待補充", "尺寸待補充", "販售資訊待補充"],
    images: [
      "images/merchandise/tshirt/tshirt-001.jpg",
      "images/merchandise/tshirt/tshirt-002.jpg"
    ],
    link: "https://www.instagram.com/gudao.team/",
    linkText: "查看相關說明"
  }
  */
];
