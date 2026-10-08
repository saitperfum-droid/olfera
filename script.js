function bindMl(root, getState, setState) {
  root.querySelectorAll('.ml-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (btn.dataset.ml === 'other') setState({ ml: getState().ml || 8, custom: true }, true);
      else setState({ ml: Number(btn.dataset.ml), custom: false }, true);
    });
  });
  const input = root.querySelector('.ml-custom');
  if (!input) return;
  ['click', 'touchstart', 'touchend', 'mousedown', 'keydown'].forEach(ev => input.addEventListener(ev, (e) => e.stopPropagation()));
  input.addEventListener('input', (e) => {
    e.stopPropagation();
    const raw = String(input.value || '').replace(/\D/g, '').slice(0, 3);
    if (!raw) return;
    const value = Math.max(1, Math.min(100, Number(raw)));
    setState({ ml: value, custom: true }, false);
    const total = root.querySelector('.line-total');
    if (total) total.textContent = 'За ' + value + ' мл: ' + (getState().price * value).toLocaleString('uk-UA') + ' ₴';
  });
}
