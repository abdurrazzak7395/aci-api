const SCRIPT_ID = 'google-recaptcha-v3-script';

function getSiteKey() {
  const envKey = (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '').trim();
  if (envKey) return envKey;

  // Public site key fallback from SVP production config.
  // Keeps login flow working if Vercel env was not set yet.
  return '6LdhZ_IUAAAAABjY17EoRq8fLJSj8dtNgcMeddrr';
}

function loadScript(siteKey) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Recaptcha requires browser environment'));
      return;
    }

    if (window.grecaptcha && typeof window.grecaptcha.execute === 'function') {
      resolve(window.grecaptcha);
      return;
    }

    let script = document.getElementById(SCRIPT_ID);
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const onLoad = () => {
      if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
        resolve(window.grecaptcha);
      } else {
        reject(new Error('Recaptcha failed to initialize'));
      }
    };

    const onError = () => reject(new Error('Failed to load Recaptcha script'));

    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
  });
}

export async function executeRecaptcha(action = 'login') {
  const siteKey = getSiteKey();
  if (!siteKey) {
    throw new Error('Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY');
  }

  const grecaptcha = await loadScript(siteKey);
  return new Promise((resolve, reject) => {
    grecaptcha.ready(() => {
      grecaptcha
        .execute(siteKey, { action })
        .then((token) => {
          if (!token) {
            reject(new Error('Recaptcha token is empty'));
            return;
          }
          resolve(token);
        })
        .catch(() => reject(new Error('Recaptcha execute failed')));
    });
  });
}
