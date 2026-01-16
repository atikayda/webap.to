// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

const STORAGE_KEY = 'webap_home_instance';
const CONFIG_KEY = 'webap_config';
const SOFTWARE_KEY = 'webap_software';
const PENDING_REDIRECT_KEY = 'webap_pending_redirect';

const DEFAULT_CONFIG = {
  social: '',
  community: '',
  photo: '',
  video: '',
  music: '',
  blog: '',
  delay: 3,
};

export function normalizeDomain(domain) {
  if (!domain || typeof domain !== 'string') return '';
  return domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
}

export function getConfig() {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
    const legacy = localStorage.getItem(STORAGE_KEY);
    if (legacy) {
      return {
        social: legacy,
        community: legacy,
        photo: legacy,
        video: legacy,
        music: legacy,
        blog: legacy,
        delay: 3,
      };
    }
    return { ...DEFAULT_CONFIG };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function setConfig(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function getHomeInstance() {
  const config = getConfig();
  return config.social || config.community || config.photo || config.video || config.music || config.blog || null;
}

export function getInstanceForType(type) {
  const config = getConfig();
  return config[type] || getHomeInstance();
}

export function setHomeInstance(domain) {
  try {
    const normalized = normalizeDomain(domain);
    if (!normalized) return null;
    const config = {
      social: normalized,
      community: normalized,
      photo: normalized,
      video: normalized,
      music: normalized,
      blog: normalized,
      delay: getConfig().delay,
    };
    setConfig(config);
    return normalized;
  } catch {
    return null;
  }
}

export function clearHomeInstance() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONFIG_KEY);
    localStorage.removeItem(SOFTWARE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function getSoftwareInfo() {
  try {
    const stored = localStorage.getItem(SOFTWARE_KEY);
    return stored ? JSON.parse(stored) : { home: null, categories: {} };
  } catch {
    return { home: null, categories: {} };
  }
}

export function setSoftwareInfo(info) {
  try {
    localStorage.setItem(SOFTWARE_KEY, JSON.stringify(info));
    return true;
  } catch {
    return false;
  }
}

export function setHomeSoftware(software) {
  const info = getSoftwareInfo();
  info.home = software;
  return setSoftwareInfo(info);
}

export function setCategorySoftware(category, software) {
  const info = getSoftwareInfo();
  info.categories[category] = software;
  return setSoftwareInfo(info);
}

export function getDelay() {
  return getConfig().delay;
}

export function setPendingRedirect(target) {
  try {
    sessionStorage.setItem(PENDING_REDIRECT_KEY, target);
  } catch {}
}

export function getPendingRedirect() {
  try {
    const target = sessionStorage.getItem(PENDING_REDIRECT_KEY);
    sessionStorage.removeItem(PENDING_REDIRECT_KEY);
    return target;
  } catch {
    return null;
  }
}
