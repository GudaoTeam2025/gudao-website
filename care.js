(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  const state = { light: 50, wind: 50, water: 50, stage: 'seedling' };

  const stages = {
    seedling: {
      label: '芽苗', title: '芽苗：先建立穩定環境',
      copy: '光量逐步建立，同時保持適度空氣流動；根系與介質尚在建立時，更應避免長時間積水與環境突然改變。',
      light: '低至中', wind: '柔和流動', water: '小量觀察', scale: .72,
      target: { light: 38, wind: 45, water: 40 }
    },
    small: {
      label: '小苗', title: '小苗：讓根系與葉型一起穩定',
      copy: '可逐步增加光量，但每次調整後保留觀察期；介質乾燥速度與新葉表現應一起記錄。',
      light: '中等建立', wind: '穩定流動', water: '乾濕觀察', scale: .84,
      target: { light: 50, wind: 52, water: 45 }
    },
    medium: {
      label: '中株', title: '中株：建立光、風、水節奏',
      copy: '株體與根系較完整，可承受較高環境負荷；光提高時，通風與水分消耗也要同步觀察。',
      light: '中至偏高', wind: '持續交換', water: '依乾燥調整', scale: .95,
      target: { light: 65, wind: 62, water: 50 }
    },
    mature: {
      label: '成株', title: '成株：高光仍不代表單項拉滿',
      copy: '成株通常能承受較高光量，但仍要避免突然改變。觀察葉溫、空氣流動、根系與介質乾燥，而非只追求強光。',
      light: '偏高可調', wind: '穩定充分', water: '依消耗判斷', scale: 1.06,
      target: { light: 75, wind: 70, water: 52 }
    }
  };

  const topics = {
    light: {
      label: 'LIGHT', title: '光', intro: '光照不是越強越好。真正重要的是植株實際接收到的光量、每天累積時間，以及是否有適應過程。',
      points: [
        ['01', '光照強度', '燈具瓦數不等於植株實際接收到的光量；距離、角度、遮擋與燈具分布都會改變結果。'],
        ['02', '每日照射時間', '高強度短時間與低強度長時間不是同一種環境，應記錄照射時段與植株反應。'],
        ['03', '成長階段', '芽苗、小苗、中株與成株的耐受及調整速度不同，換環境時要逐步建立。']
      ],
      note: '若提高光照，請同步觀察葉片溫度、空氣流動、介質乾燥與水分消耗，而不是只調整燈具。'
    },
    wind: {
      label: 'AIRFLOW', title: '風', intro: '風不只是降溫，也是在室內環境中協助熱與水氣離開植株周圍。重點是穩定空氣交換，不是長時間強力直吹。',
      points: [
        ['01', '帶走熱', '協助降低葉片與燈具附近的熱停滯。'],
        ['02', '協助蒸散', '空氣流動會影響葉面與介質周圍的水分交換。'],
        ['03', '減少悶濕', '降低葉心、盆面及植株間長時間潮濕停滯的機會。']
      ],
      note: '風量提高後，介質可能更快乾燥；請重新觀察盆重與介質，而不是沿用原本給水節奏。'
    },
    water: {
      label: 'WATER', title: '水', intro: '不要只看日曆決定澆水。介質乾燥、盆器、光照、通風、溫度、植株大小與季節都會影響水分需求。',
      points: [
        ['01', '先看介質', '確認表層以下的乾燥程度、盆重與排水狀況。'],
        ['02', '再看環境', '光、風、溫度與濕度改變後，原本的給水週期可能不再適合。'],
        ['03', '最後看植株', '新葉、葉片硬度、根系狀況與近期生長，可提供更多判斷線索。']
      ],
      note: '不要用「固定幾天一次」取代觀察。澆水後也要確認多餘水分能排出，避免長時間積水。'
    }
  };

  const symptoms = {
    '葉片變軟': { causes: ['水分過多或根系功能受影響', '過度乾燥造成失水', '環境溫度或根系突然改變'], checks: ['先確認介質是濕、乾，還是表乾內濕', '檢查植株基部是否軟化、變色或有異味', '回顧近期是否換盆、降溫或大幅改變光照'] },
    '葉片變長': { causes: ['光量不足', '燈具位置或照射方向不均', '植株正朝單一方向尋光'], checks: ['檢查燈具距離與覆蓋範圍', '確認每日照射時間是否穩定', '比較近期新葉與舊葉的長度及株型'] },
    '葉色變淡': { causes: ['光環境突然改變', '光量不足或過強', '根系、養分或環境壓力'], checks: ['確認變淡位置是新葉、舊葉或受光面', '回顧燈距、時數與近期調整', '檢查根系環境與介質排水'] },
    '葉尖乾枯': { causes: ['環境過乾或水分供應波動', '突然增光或熱累積', '物理碰傷或鹽分累積'], checks: ['觀察乾枯是否持續擴大', '確認葉尖是否靠近燈具或風口', '檢查近期給水、施肥與水質變化'] },
    '葉片出現斑點': { causes: ['日灼或物理傷害', '長時間潮濕後的病斑', '蟲害或其他環境壓力'], checks: ['記錄斑點是否擴大、凹陷或滲水', '檢查葉背、葉心與相鄰植株', '先隔離並避免葉面長時間潮濕'] },
    '中心腐爛': { causes: ['葉心長時間積水或悶濕', '根冠部腐爛', '傷口、病原或蟲害造成組織崩解'], checks: ['立即隔離並停止例行澆水', '確認中心是否軟化、變黑或有異味', '儘快請有經驗的栽培者或專業人員檢查'] },
    '葉片歪向一側': { causes: ['單側光源', '植株尋光', '盆器傾斜或根系固定不足'], checks: ['確認光源是否集中在單一方向', '檢查盆器是否水平與植株是否鬆動', '分階段調整光源位置，不要突然大幅旋轉'] }
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
    const target = stages[state.stage].target;

    ['light', 'wind', 'water'].forEach(key => {
      $(`#${key}-output`).textContent = state[key];
      $(`#${key}-node-value`).textContent = state[key];
      document.documentElement.style.setProperty(`--${key}-level`, state[key] / 100);
    });

    const drying = Math.max(5, Math.min(95, 26 + light * .38 + wind * .42 - water * .32));
    $('#drying-bar').style.width = `${drying}%`;
    $('#drying-label').textContent = drying > 72 ? '較快' : drying < 38 ? '較慢' : '中等';

    const heatNeed = light * .72 + 12;
    const waterDemand = light * .48 + wind * .28;
    $('#light-suggestion').textContent = light > 70
      ? '光照偏高：請同步確認散熱、通風與植株適應狀況。'
      : light < 30 ? '光照偏低：觀察新葉是否拉長、變薄或朝單側生長。' : '維持穩定時數，調整後保留觀察期。';
    $('#wind-suggestion').textContent = wind + 10 < heatNeed
      ? '相對目前光照，空氣流動可能不足；先改善環境交換，避免只用強風直吹。'
      : wind > 80 ? '空氣流動偏高：同步注意介質是否乾得過快。' : '目前風量可作為觀察起點，留意葉片與介質周圍是否悶熱。';
    $('#water-suggestion').textContent = water > 72 && drying < 55
      ? '水分負荷偏高且乾燥較慢：先觀察介質內部與根冠環境。'
      : water < 25 && waterDemand > 55 ? '高消耗環境下水分設定偏低：請觀察植株與盆重，不要直接按日曆補水。' : '以介質乾燥、盆重與近期新葉狀態共同判斷。';

    let balance = { title: '平衡觀察', short: '目前設定接近中間值', copy: '請同時觀察葉片表現、介質乾燥速度與空氣流動。', name: 'balanced' };
    if (light > 72 && wind < 55) balance = { title: '高光・通風待觀察', short: '光照提高，散熱與空氣交換未同步', copy: '建議先觀察葉溫、風路與介質乾燥，不要只繼續增加光量。', name: 'warning' };
    else if (water > 72 && wind < 55) balance = { title: '水分偏高', short: '環境偏濕且流動較弱', copy: '確認盆內是否表乾內濕，並避免葉心與根冠長時間潮濕。', name: 'warning' };
    else if (light > 72 && wind >= 60) balance = { title: '偏高光環境', short: '光與風同步提高', copy: '水分消耗與乾燥速度可能增加，請依植株和介質重新觀察。', name: 'active' };
    else if (wind > 78 && water < 30) balance = { title: '乾燥速度偏快', short: '風量高、水分負荷低', copy: '留意介質是否乾得過快，以及植株是否出現失水表現。', name: 'active' };
    else if (light < 28) balance = { title: '偏低光環境', short: '光量設定較低', copy: '留意新葉是否拉長、葉色改變或植株朝單側尋光。', name: 'soft' };

    const stageDeviation = Math.abs(light - target.light) + Math.abs(wind - target.wind) + Math.abs(water - target.water);
    if (stageDeviation < 28) balance.copy += ` 目前也接近「${stages[state.stage].label}」的示意觀察區間。`;
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
    $('#diagnosis-result').innerHTML = `<p class="diagnosis-label">目前觀察</p><h3>${symptom}</h3><div class="diagnosis-columns"><section><h4>可能相關因素</h4><ul>${item.causes.map(text => `<li>${text}</li>`).join('')}</ul></section><section><h4>建議先檢查</h4><ul>${item.checks.map(text => `<li>${text}</li>`).join('')}</ul></section></div><p class="diagnosis-warning">同一症狀可能有多種原因。若組織快速軟爛、異味或病斑持續擴大，請先隔離植株並尋求專業協助。</p>`;
  }

  function closeDiagnosis() {
    if ($('#diagnosis-modal')) $('#diagnosis-modal').hidden = true;
    if ($('#topic-drawer')?.hidden) document.body.classList.remove('modal-open');
  }

  setStage('seedling');
  update();
})();
