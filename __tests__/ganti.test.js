/**
 * Tests for ganti.js — the redirect button handler.
 *
 * ganti.js executes immediately on require(), so we set up the DOM
 * before loading it and use jest.isolateModules to get a fresh copy
 * for each test.
 */

describe('ganti.js — redirect handler', () => {
  let moreBtn;

  beforeEach(() => {
    // Build the minimal DOM that ganti.js expects
    document.body.innerHTML = '<button id="moreBtn">Selengkapnya</button>';
    moreBtn = document.getElementById('moreBtn');

    // Mock window.location (jsdom doesn't navigate)
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.resetModules();
  });

  test('registers a click listener on the moreBtn element', () => {
    const spy = jest.spyOn(moreBtn, 'addEventListener');
    jest.isolateModules(() => {
      require('../ganti');
    });
    expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
    spy.mockRestore();
  });

  test('navigates to Index.html when moreBtn is clicked', () => {
    jest.isolateModules(() => {
      require('../ganti');
    });
    moreBtn.click();
    expect(window.location.href).toBe('Index.html');
  });

  test('does not navigate before the button is clicked', () => {
    jest.isolateModules(() => {
      require('../ganti');
    });
    expect(window.location.href).toBe('');
  });
});
