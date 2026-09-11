(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  const state = { light: 50, wind: 50, water: 50, stage: 'seedling' };

  const stages = {
    seedling: {
      label: '小苗', title: '苗芽期：先建立穩定根系',
      copy: '光量逐步建立，同時保持適度空氣流動；根系與介質尚在建立\n光照建議:PPFD：約100或LUX：5,000–30,000',
      light: '低至中', wind: '穩定通風', water: '小量觀察', scale: .72,
      target: { light: 38, wind: 45, water: 40 }
    },
    small: {
      label: '實葉期', title: '初見型態往小亞成邁進：讓根系與葉型一起穩定成長',
      copy: '可逐步增加光量與照射時間，並持續觀察植株表現，建立適合自己的養護方式\n光照建議:PPFD：約400或LUX：30,000–50,000',
      light: '中等建立', wind: '穩定通風', water: '乾濕觀察', scale: .84,
      target: { light: 50, wind: 52, water: 45 }
    },
    medium: {
      label: '小亞成', title: '小亞成株：穩定養護，追求型態',
      copy: '植株根系逐漸完整，可逐步提高環境強度，但仍需依植株適應狀況調整；光提高時，通風與給水也要同步觀察\n光照建議:PPFD：約800或LUX：50,000–100,000',
      light: '中至偏高', wind: '穩定通風', water: '依乾燥調整', scale: .95,
      target: { light: 65, wind: 62, water: 50 }
    },
    mature: {
      label: '亞成株', title: '成株：留意光照與根系',
      copy: '成株通常能適應較高光量，但環境調整仍應循序漸進，避免短時間內大幅改變\n光照建議:PPFD：1000+或LUX：100,000+',
      light: '偏高光', wind: '穩定通風', water: '依消耗判斷', scale: 1.06,
      target: { light: 75, wind: 70, water: 52 }
    }
  };

  const topics = {
    light: {
      label: 'LIGHT', title: '光', intro: '光照不過度追求馬上強光，真正重要的是植株階段需求的光量、每天照射時間，以及是否有適應',
      points: [
        ['01', '光照強度', '燈具瓦數光譜與強度，各品牌不同，距離、角度、都會改變結果'],
        ['02', '每日照射時間', '高強度短時間與低強度長時間都可以嘗試，但還是要觀察植株表現，建議照射12-16小時'],
        ['03', '成長階段', '芽苗、小苗、中株與成株的耐受及調整速度不同，換環境時要逐步增加光照強度或是時長']
      ],
      note: '若提高光照，請同步觀察葉片表現，避免植株出現異狀'
    },
    wind: {
      label: 'AIRFLOW', title: '風', intro: '風不只是降溫，也是在室內環境中協助熱與降低染菌風險，穩定空氣交換',
      points: [
        ['01', '帶走熱', '協助降低葉片與燈具附近的熱停滯'],
        ['02', '協助蒸散', '空氣流動會影響葉面與介質周圍的水分交換'],
        ['03', '減少悶濕', '降低葉心、盆面及植株間長時間潮濕染菌的機會']
      ],
      note: '風量提高後，介質可能更快乾燥；請觀察盆重與介質狀態，靈活調整給水節奏。'
    },
    water: {
      label: 'WATER', title: '水', intro: '初期建立給水頻率，隨著植株成長，光照、通風、植株大小與季節都會影響水分需求',
      points: [
        ['01', '先看介質', '確認介質表面的乾燥程度、植株盆重與環境濕度狀態'],
        ['02', '再看環境', '光、風、溫度與濕度改變後，原本的給水週期可能不再適合'],
        ['03', '最後看植株', '新葉、捏葉片硬度、根系狀況與近期生長，可提供更多判斷線索']
      ],
      note: '澆水後也要確認多餘水分能排出，避免長時間積水，腰水/泡盆培育請評估環境合適再進行操作'
    }
  };

  const symptoms = {
    '剛入盆植株': { causes: ['根系功能未建立', '換盆後立即進入強光環境', '可適度黑網遮光'], checks: ['觀察中心葉是否開始成長', '手指輕微推動植株，是否不好推動', '持續觀察植株狀態，長時間未開葉，可能根系未建立'] },
    '葉片變軟': { causes: ['根系功能受影響', '過度控水造成失水', '環境溫度或根系不良'], checks: ['先確認給水頻率是否過長', '檢查植株是否葉片皺褶明顯、變色', '回顧近期是否換盆、降溫或大幅改變光照'] },
    '葉片變長': { causes: ['光量不足', '燈具位置或照射方向不均', '植株正朝單一方向尋光或徒長'], checks: ['檢查燈具距離與覆蓋範圍', '確認每日照射時間是否過少', '比較近期新葉與舊葉的長度及株型'] },
    '葉片發紅': { causes: ['光環境突然改變', '光照突然過強', '根系、養分或環境壓力(過熱)'], checks: ['確認變色位置是新葉、舊葉或受光面', '回顧燈距、時數與近期調整', '檢查根系環境與介質排水'] },
    '葉尖乾枯燒葉': { causes: ['環境過乾或過久未換盆', '突然增光或環境過熱', '過久無換盆'], checks: ['觀察狀態是否持續擴大', '確認葉尖是否底葉發生還是中心新生長葉', '檢查近期給水、光照變化、換盆修根時間'] },
    '葉片出現斑點': { causes: ['日灼或物理傷害', '長時間潮濕後的病斑', '蟲害或其他環境壓力'], checks: ['記錄斑點是否擴大、凹陷或滲水', '檢查葉背、葉心與相鄰植株', '先隔離並避免葉面長時間潮濕'] },
    '中心或底葉腐爛': { causes: ['葉心長時間積水或悶濕', '根部底葉腐爛', '傷口、病原或蟲害造成染菌'], checks: ['先隔離植株，暫停原本的例行給水', '確認腐爛範圍與介質狀態', '若無法判斷原因，可整理植株狀況與環境資訊，再與孤島交流討論'] },
    '葉片歪向一側': { causes: ['單側光源', '植株尋光', '盆器傾斜或根系固定不足'], checks: ['確認光源是否集中在單一方向', '檢查盆器是否水平與植株是否種歪', '分階段調整光源位置，視情況脫盆檢查'] }
  };

  const ranges = { light: $('#light-range'), wind: $('#wind-range'), water: $('#water-range') };

  Object.entries(ranges).forEach(([key, input]) => input?.addEventListener('input', () => {
    state[key] = Number(input.value);
    update();
  }));

  $$('.factor-node, .knowledge-card[data-topic]').forEach(button => button.addEventListener('click', () => openTopic(button.dataset.topic)));
  $$('.stage-button').forEach(button => button.addEventListener('click', () => setStage(button.dataset.stage)));
  $('#open-diagnosis')?.addEventListener('click', openDiagnosis);
  $('#close-drawer')?.addEventListener('click', closeTopic);
  $('.drawer-backdrop')?.addEventListener('click', closeTopic);
  $('#close-diagnosis')?.addEventListener('click', closeDiagnosis);
  $('.diagnosis-backdrop')?.addEventListener('click', closeDiagnosis);

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    closeTopic();
    closeDiagnosis();
  });

  function setStage(stage) {
    if (!stages[stage]) return;
    state.stage = stage;
    const config = stages[stage];
    $$('.stage-button').forEach(button => {
      const active = button.dataset.stage === stage;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    $('#stage-title').textContent = config.title;
    $('#stage-copy').textContent = config.copy;
    $('#stage-light').textContent = config.light;
    $('#stage-wind').textContent = config.wind;
    $('#stage-water').textContent = config.water;
    $('#stage-visual-label').textContent = config.label;
    $('.plant-stage-visual').dataset.stage = stage;
    $('.plant-stage-visual').style.setProperty('--plant-scale', config.scale);
    update();
  }

function update() {
  const { light, wind, water } = state;

  ['light', 'wind', 'water'].forEach(key => {
    $(`#${key}-output`).textContent = state[key];
    $(`#${key}-node-value`).textContent = state[key];
    document.documentElement.style.setProperty(`--${key}-level`, state[key] / 100);
  });

  /*
   * 乾燥傾向
   * 光照、通風提高 → 乾燥傾向增加
   * 水分提高 → 乾燥傾向降低
   * 此數值為環境條件推估，不代表實際介質乾燥傾向
   */
  const drying = Math.max(
    5,
    Math.min(95, 26 + light * 0.38 + wind * 0.42 - water * 0.32)
  );

  $('#drying-bar').style.width = `${drying}%`;
  $('#drying-label').textContent =
    drying > 72 ? '較快' :
    drying < 38 ? '較慢' :
    '中等';

  /*
   * 光照提高時，對空氣交換與散熱的需求也會提高
   */
  const airflowNeed = light * 0.72 + 12;

  /*
   * 光照、通風提高時，水分消耗與乾燥傾向通常也會增加
   */
  const dryingDemand = light * 0.48 + wind * 0.28;

  /*
   * 光照觀察
   */
  $('#light-suggestion').textContent =
    light > 70
      ? '光照偏高：請同步觀察葉片溫度、植株適應狀況與介質乾燥速度'
      : light < 30
        ? '光照偏低：觀察新葉是否拉長、變薄，或植株是否出現明顯尋光表現'
        : '維持穩定光照時數，調整後保留觀察期';

  /*
   * 通風觀察
   */
  $('#wind-suggestion').textContent =
    wind + 10 < airflowNeed
      ? '相對目前光照，空氣流動可能不足；建議先改善環境交換，避免只用強風直吹'
      : wind > 80
        ? '空氣流動偏高：同步觀察介質是否乾燥過快與植株失水表現'
        : '目前風量可作為觀察起點，留意植株與介質後續變化';

  /*
   * 水分觀察
   */
  $('#water-suggestion').textContent =
    water > 72 && drying < 55
      ? '水分設定偏高且乾燥較慢：觀察介質是否長時間潮濕，並留意葉心與根系環境'
      : water < 25 && dryingDemand > 55
        ? '水分設定偏低且乾燥傾向較高：請搭配盆重、介質乾燥程度與葉片狀態判斷是否需要調整'
        : '以介質乾燥、盆重與近期新葉狀態共同判斷';

let balance = {
  title: '平衡觀察',
  short: '三項環境條件目前沒有明顯失衡',
  copy: '建議同步觀察葉片表現、空氣流動與介質乾燥速度，依植株反應逐步調整。',
  name: 'balanced'
};

/*
 * Balance 判斷原則
 *
 * 1. 優先判斷「兩項以上的關係」，避免單一數值過高就代表整體環境負荷過高。
 * 2. 光、風、水三項皆高時，才判定為整體高強度環境。
 * 3. 高光時優先觀察通風是否跟上。
 * 4. 高水時優先觀察通風與乾燥速度。
 * 5. 高風時優先觀察水分是否跟得上。
 * 6. 單項偏高或偏低，只描述該項，不延伸成整體環境判斷。
 * 7. 所有結果皆為「觀察提示」，不是固定養護標準。
 */


/* =========================================================
 * 1. 三項皆高
 * 光、風、水同時處於高區間，代表整體環境強度較高
 * ========================================================= */
if (light >= 85 && wind >= 85 && water >= 85) {
  balance = {
    title: '三項指標偏高',
    short: '光、風、水目前皆處於較高設定',
    copy: '目前屬於較高強度的環境設定，光照、空氣流動與水分供應皆較高，請同步觀察葉片表現、植株適應狀況與介質乾燥速度',
    name: 'active'
  };
}


/* =========================================================
 * 2. 高光＋低通風
 * 光提高，但空氣流動沒有同步提高
 * 優先處理高光與散熱／空氣交換的關係
 * ========================================================= */
else if (light >= 73 && wind < 55) {
  balance = {
    title: '高光・通風待觀察',
    short: '光照較高，但空氣流動未同步提高',
    copy: '目前光照強度較高，建議優先觀察葉片溫度與植株適應狀況，並確認環境是否有足夠的空氣交換，不宜只持續增加光量',
    name: 'warning'
  };
}


/* =========================================================
 * 3. 高水＋低通風
 * 水分高且空氣交換不足，優先觀察介質乾燥與悶濕狀況
 * ========================================================= */
else if (water >= 73 && wind < 55) {
  balance = {
    title: '水分偏高・通風待觀察',
    short: '水分較高，空氣流動相對不足',
    copy: '目前水分設定較高，且空氣流動相對不足，請觀察介質是否長時間保持潮濕，以及盆內與植株周圍的水氣是否不易散去',
    name: 'warning'
  };
}


/* =========================================================
 * 4. 高風＋低水
 * 空氣流動強、水分低，乾燥速度可能較快
 * ========================================================= */
else if (wind >= 79 && water < 30) {
  balance = {
    title: '乾燥速度偏快',
    short: '風量較高，水分設定相對偏低',
    copy: '目前空氣流動較強且水分設定偏低，介質乾燥速度可能加快，請搭配盆重、介質狀態與葉片表現判斷是否需要調整',
    name: 'active'
  };
}

/* =========================================================
 * 5. 高水＋乾燥較慢
 * 透過實際計算出的 drying 判斷，而不是只看 water
 * ========================================================= */
else if (water >= 79 && drying < 55) {
  balance = {
    title: '水分負荷偏高',
    short: '水分設定較高，環境乾燥速度相對較慢',
    copy: '目前水分設定較高且乾燥傾向較慢，請觀察介質是否長時間潮濕，並確認盆器排水與通風狀況',
    name: 'warning'
  };
}


/* =========================================================
 * 6. 高光＋足夠通風＋水分不過低
 * 光與風有同步配置，但仍需觀察水分消耗
 *
 * 注意：
 * 這裡刻意加入 water >= 30，
 * 避免「光高＋風高＋水很低」仍被判斷成光風配置良好。
 * ========================================================= */
else if (light >= 73 && wind >= 60 && water >= 30) {
  balance = {
    title: '光風同步提高',
    short: '光照提高，空氣流動也有同步配置',
    copy: '目前光照與空氣流動皆提高，環境中的水分消耗可能增加，請持續觀察介質乾燥速度與植株適應狀況，再依實際表現調整',
    name: 'active'
  };
}


/* =========================================================
 * 7. 高光＋水分偏低
 * 即使通風不低，也需要提醒水分消耗
 * ========================================================= */
else if (light >= 73 && water < 30) {
  balance = {
    title: '高光・水分待觀察',
    short: '光照較高，水分設定相對偏低',
    copy: '目前光照強度較高，但水分設定偏低，請觀察介質乾燥速度與葉片狀態，避免僅依固定週期給水',
    name: 'warning'
  };
}



/* =========================================================
 * 8. 光照偏高，但沒有形成明顯失衡
 * 單純描述光，不延伸判斷整體環境
 * ========================================================= */
else if (light >= 79) {
  balance = {
    title: '光照設定偏高',
    short: '目前光照強度處於較高區間',
    copy: '目前光照設定較高，請搭配觀察葉片狀態、葉色與植株適應狀況，並留意光照提高後的水分消耗與乾燥速度',
    name: 'active'
  };
}


/* =========================================================
 * 9. 水分偏高，但沒有形成明顯失衡
 * 單純描述水，不代表整體環境有問題
 * ========================================================= */
else if (water >= 79) {
  balance = {
    title: '水分設定偏高',
    short: '目前水分設定處於較高區間',
    copy: '目前水分設定較高，實際影響仍需搭配通風與介質乾燥速度觀察，並確認多餘水分能正常排出',
    name: 'warning'
  };
}


/* =========================================================
 * 10. 通風偏低
 * 優先描述空氣交換，不直接判定一定會造成問題
 * ========================================================= */
else if (wind < 25) {
  balance = {
    title: '空氣流動偏低',
    short: '目前環境的空氣交換較弱',
    copy: '目前空氣流動較弱，請留意植株周圍是否有熱與水氣停滯，建議以穩定空氣流動逐步改善環境',
    name: 'soft'
  };
}


/* =========================================================
 * 11. 光照偏低
 * ========================================================= */
else if (light < 28) {
  balance = {
    title: '光照設定偏低',
    short: '目前光量處於較低區間',
    copy: '目前光照設定較低，請留意新葉是否拉長、變薄、葉刺表現減弱，或植株是否朝單一方向尋光，再依植株狀態逐步增加光照',
    name: 'soft'
  };
}


/* =========================================================
 * 12. 水分偏低
 * ========================================================= */
else if (water < 28) {
  balance = {
    title: '水分設定偏低',
    short: '目前水分設定處於較低區間',
    copy: '目前水分設定較低，請觀察介質乾燥速度、盆重與葉片狀態，確認目前給水頻率是否符合植株實際消耗',
    name: 'soft'
  };
}


/* =========================================================
 * 13. 生長階段參考值
 *
 * 不把 target 當成「標準答案」，
 * 只用來判斷目前設定是否接近該階段的示意觀察區間。
 * ========================================================= */
const stageReference = stages[state.stage].target;

const stageDeviation =
  Math.abs(light - stageReference.light) +
  Math.abs(wind - stageReference.wind) +
  Math.abs(water - stageReference.water);

if (stageDeviation < 28) {
  balance.copy += ` 目前也接近「${stages[state.stage].label}」的示意觀察區間。`;
}


/* =========================================================
 * 14. 更新 Balance 顯示
 * ========================================================= */
$('#balance-title').textContent = balance.title;
$('#balance-short').textContent = balance.short;
$('#balance-copy').textContent = balance.copy;
$('#balance-badge').dataset.state = balance.name;
  }

  function openTopic(key) {
    const topic = topics[key];
    if (!topic) return;
    $('#drawer-label').textContent = topic.label;
    $('#drawer-title').textContent = topic.title;
    $('#drawer-intro').textContent = topic.intro;
    $('#drawer-points').innerHTML = topic.points.map(([number, title, copy]) => `<article><span>${number}</span><div><h3>${title}</h3><p>${copy}</p></div></article>`).join('');
    $('#drawer-note').textContent = topic.note;
    $('#topic-drawer').hidden = false;
    document.body.classList.add('modal-open');
    $('#close-drawer').focus();
  }

  function closeTopic() {
    if ($('#topic-drawer')) $('#topic-drawer').hidden = true;
    if ($('#diagnosis-modal')?.hidden) document.body.classList.remove('modal-open');
  }

  function openDiagnosis() {
    $('#symptom-list').innerHTML = Object.keys(symptoms).map((symptom, index) => `<button type="button" data-symptom="${symptom}" class="${index === 0 ? 'active' : ''}">${symptom}</button>`).join('');
    $$('#symptom-list button').forEach(button => button.addEventListener('click', () => selectSymptom(button.dataset.symptom)));
    $('#diagnosis-modal').hidden = false;
    document.body.classList.add('modal-open');
    selectSymptom(Object.keys(symptoms)[0]);
    $('#close-diagnosis').focus();
  }

  function selectSymptom(symptom) {
    const item = symptoms[symptom];
    if (!item) return;
    $$('#symptom-list button').forEach(button => button.classList.toggle('active', button.dataset.symptom === symptom));
    $('#diagnosis-result').innerHTML = `<p class="diagnosis-label">目前觀察</p><h3>${symptom}</h3><div class="diagnosis-columns"><section><h4>可能相關因素</h4><ul>${item.causes.map(text => `<li>${text}</li>`).join('')}</ul></section><section><h4>建議先檢查</h4><ul>${item.checks.map(text => `<li>${text}</li>`).join('')}</ul></section></div><p class="diagnosis-warning">症狀可能有多種原因，若問題持續惡化，請先隔離植株或是向孤島討論交流</p>`;
  }

  function closeDiagnosis() {
    if ($('#diagnosis-modal')) $('#diagnosis-modal').hidden = true;
    if ($('#topic-drawer')?.hidden) document.body.classList.remove('modal-open');
  }

setStage('seedling');
})();
