/* 全站資料只要修改這個檔案 */
const GUDAO_IG = "https://www.instagram.com/gudao.team/";
document.querySelectorAll('[data-ig]').forEach(a => a.href = GUDAO_IG);

window.GUDAO_EVENTS = [
 {date:"待公布",title:"孤島近期活動",description:"活動地點、時間與參加方式將公布於 Instagram。",image:"images/events/event-001.jpg",link:GUDAO_IG},
 {date:"待公布",title:"龍舌蘭交流活動",description:"可替換圖片、標題與說明。",image:"images/events/event-002.png",link:GUDAO_IG}
];
function renderEvents(){
 const el=document.querySelector('#event-grid'); if(!el)return;
 el.innerHTML=window.GUDAO_EVENTS.map(e=>`<article class="event-card"><div class="media"><img src="${e.image}" alt="${e.title}" onerror="this.style.display='none'"></div><div class="pad"><small>${e.date}</small><h3>${e.title}</h3><p>${e.description}</p><a href="${e.link}" target="_blank" rel="noopener noreferrer">查看活動 ↗</a></div></article>`).join('');
}
