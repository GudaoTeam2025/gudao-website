(() => {
  const STORAGE_KEY = 'gudao_sales_records_v2';
  const ADMIN_PIN = '2025';
  const INITIAL_ITEM_COUNT = 5;
  const MAX_ITEM_COUNT = 30;

  const products = (window.GUDAO_SALE_PRODUCTS || []).filter(product => product.active !== false);
  const form = document.querySelector('#sale-form');
  const itemsRoot = document.querySelector('#sale-items');
  const template = document.querySelector('#sale-item-template');
  const addItemButton = document.querySelector('#add-item');
  const totalElement = document.querySelector('#grand-total');
  const formMessage = document.querySelector('#form-message');
  const customerView = document.querySelector('#customer-view');
  const successView = document.querySelector('#success-view');
  const adminView = document.querySelector('#admin-view');

  const money = value => `NT$ ${Number(value || 0).toLocaleString('zh-TW')}`;
  const escapeCsv = value => `"${String(value ?? '').replaceAll('"', '""')}"`;

  function productOptions() {
    const options = ['<option value="">請選擇商品</option>'];
    products.forEach(product => {
      options.push(`<option value="${product.id}" data-price="${product.price}">${product.name}｜${money(product.price)}</option>`);
    });
    options.push('<option value="__manual__">手動填寫商品</option>');
    return options.join('');
  }

  function addItem() {
    if (itemsRoot.children.length >= MAX_ITEM_COUNT) {
      showMessage(`每筆交易最多 ${MAX_ITEM_COUNT} 項商品。`, true);
      return;
    }

    const item = template.content.firstElementChild.cloneNode(true);
    const select = item.querySelector('.product-select');
    const manualLabel = item.querySelector('.manual-name-label');
    const manualInput = item.querySelector('.manual-name');
    const priceInput = item.querySelector('.item-price');
    select.innerHTML = productOptions();

    select.addEventListener('change', () => {
      const manual = select.value === '__manual__';
      manualLabel.hidden = !manual;
      manualInput.required = manual;
      if (!manual) manualInput.value = '';
      const selected = select.selectedOptions[0];
      if (select.value && !manual) priceInput.value = selected.dataset.price || 0;
      if (manual) priceInput.value = '';
      updateTotal();
    });

    priceInput.addEventListener('input', updateTotal);
    item.querySelector('.remove-item').addEventListener('click', () => {
      item.remove();
      renumberItems();
      updateTotal();
    });

    itemsRoot.appendChild(item);
    renumberItems();
  }

  function renumberItems() {
    [...itemsRoot.children].forEach((item, index) => {
      item.querySelector('.item-number').textContent = String(index + 1).padStart(2, '0');
      item.querySelector('.remove-item').disabled = itemsRoot.children.length === 1;
    });
    addItemButton.disabled = itemsRoot.children.length >= MAX_ITEM_COUNT;
  }

  function updateTotal() {
    const total = [...document.querySelectorAll('.item-price')]
      .reduce((sum, input) => sum + Math.max(0, Number(input.value) || 0), 0);
    totalElement.textContent = money(total);
    return total;
  }

  function collectItems() {
    return [...itemsRoot.querySelectorAll('.sale-item')].map(item => {
      const select = item.querySelector('.product-select');
      const price = Math.max(0, Number(item.querySelector('.item-price').value) || 0);
      let name = '';
      if (select.value === '__manual__') name = item.querySelector('.manual-name').value.trim();
      else if (select.value) name = select.selectedOptions[0].textContent.split('｜')[0].trim();
      return { productId: select.value, name, price };
    }).filter(item => item.name || item.price > 0);
  }

  function showMessage(message, error = false) {
    formMessage.textContent = message;
    formMessage.classList.toggle('error', error);
  }

  function getRecords() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function saveRecords(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function createId() {
    const now = new Date();
    const stamp = [now.getFullYear(), String(now.getMonth()+1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('');
    const suffix = String(Date.now()).slice(-5);
    return `GDS-${stamp}-${suffix}`;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.querySelector('#customer-name').value.trim();
    const social = document.querySelector('#social-name').value.trim();
    const confirmed = document.querySelector('#confirm-data').checked;
    const items = collectItems();

    if (!name || !social) return showMessage('請填寫姓名與 IG／FB 名稱。', true);
    if (items.length === 0) return showMessage('請至少選擇或手動填寫一項商品。', true);
    if (items.some(item => !item.name || item.price <= 0)) return showMessage('每一項商品都需要名稱與大於 0 的金額。', true);
    if (!confirmed) return showMessage('請勾選資料確認。', true);

    const record = {
      id: createId(),
      createdAt: new Date().toISOString(),
      customerName: name,
      socialName: social,
      items,
      total: items.reduce((sum, item) => sum + item.price, 0),
      note: document.querySelector('#sale-note').value.trim()
    };

    const records = getRecords();
    records.unshift(record);
    saveRecords(records);

    document.querySelector('#success-id').textContent = record.id;
    document.querySelector('#success-total').textContent = money(record.total);
    customerView.hidden = true;
    successView.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function resetForm() {
    form.reset();
    itemsRoot.innerHTML = '';
    for (let i = 0; i < INITIAL_ITEM_COUNT; i += 1) addItem();
    updateTotal();
    showMessage('');
    successView.hidden = true;
    customerView.hidden = false;
  }

  document.querySelector('#new-sale').addEventListener('click', resetForm);
  document.querySelector('#print-receipt').addEventListener('click', () => window.print());
  addItemButton.addEventListener('click', addItem);

  document.querySelector('#open-admin').addEventListener('click', () => {
    customerView.hidden = true;
    successView.hidden = true;
    adminView.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.querySelector('#close-admin').addEventListener('click', () => {
    adminView.hidden = true;
    customerView.hidden = false;
  });

  document.querySelector('#admin-login-button').addEventListener('click', () => {
    const message = document.querySelector('#admin-login-message');
    if (document.querySelector('#admin-pin').value !== ADMIN_PIN) {
      message.textContent = '管理 PIN 不正確。';
      message.classList.add('error');
      return;
    }
    document.querySelector('#admin-login').hidden = true;
    document.querySelector('#admin-content').hidden = false;
    renderRecords();
  });

  function renderRecords(query = '') {
    const records = getRecords();
    const keyword = query.trim().toLowerCase();
    const filtered = keyword ? records.filter(record => {
      const text = [record.id, record.customerName, record.socialName, record.note, ...record.items.map(item => item.name)].join(' ').toLowerCase();
      return text.includes(keyword);
    }) : records;

    document.querySelector('#stat-count').textContent = records.length;
    document.querySelector('#stat-items').textContent = records.reduce((sum, record) => sum + record.items.length, 0);
    document.querySelector('#stat-total').textContent = money(records.reduce((sum, record) => sum + record.total, 0));

    const tbody = document.querySelector('#record-list');
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td class="empty-record" colspan="5">目前沒有符合的販售紀錄</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(record => `
      <tr>
        <td>${new Date(record.createdAt).toLocaleString('zh-TW')}<br><small>${record.id}</small></td>
        <td><strong>${record.customerName}</strong><br>${record.socialName}${record.note ? `<br><small>${record.note}</small>` : ''}</td>
        <td><ul class="record-items">${record.items.map(item => `<li>${item.name}｜${money(item.price)}</li>`).join('')}</ul></td>
        <td><strong>${money(record.total)}</strong></td>
        <td><button class="delete-record" type="button" data-id="${record.id}">刪除</button></td>
      </tr>`).join('');

    tbody.querySelectorAll('.delete-record').forEach(button => button.addEventListener('click', () => {
      if (!window.confirm(`確定刪除 ${button.dataset.id}？`)) return;
      saveRecords(getRecords().filter(record => record.id !== button.dataset.id));
      renderRecords(document.querySelector('#admin-search').value);
    }));
  }

  document.querySelector('#admin-search').addEventListener('input', event => renderRecords(event.target.value));

  document.querySelector('#export-csv').addEventListener('click', () => {
    const records = getRecords();
    const rows = [['交易編號','時間','姓名','IG或FB','商品明細','總金額','備註']];
    records.forEach(record => rows.push([
      record.id,
      new Date(record.createdAt).toLocaleString('zh-TW'),
      record.customerName,
      record.socialName,
      record.items.map(item => `${item.name} ${item.price}`).join('；'),
      record.total,
      record.note
    ]));
    const csv = '\uFEFF' + rows.map(row => row.map(escapeCsv).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `gudao-sales-${new Date().toISOString().slice(0,10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  });

  document.querySelector('#clear-records').addEventListener('click', () => {
    if (!window.confirm('確定清除本裝置所有販售紀錄？此操作無法復原。')) return;
    localStorage.removeItem(STORAGE_KEY);
    renderRecords();
  });

  resetForm();
})();
