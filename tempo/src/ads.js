// Ate Your Homework: AdMob integration for Tempo.
// Order on launch: GDPR consent (UMP) -> iOS tracking prompt (ATT) -> initialize -> top banner.
// Interstitial shows after a finished game, at most once every 3 games and 3 minutes.

import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdPosition,
  BannerAdSize,
  BannerAdPluginEvents,
  AdmobConsentStatus,
} from '@capacitor-community/admob';

// ============================================================
// SWAP THESE FOR YOUR REAL AD UNIT IDS FROM ADMOB BEFORE RELEASE.
// Current values are Google's official test units (safe to tap).
// ============================================================

const IDS = {
  // Real Tempo iOS units (AdMob app ca-app-pub-5434218408649372~2668309091)
  ios: {
    banner: 'ca-app-pub-5434218408649372/2852015617',
    interstitial: 'ca-app-pub-5434218408649372/4231390946',
  },
  // Android: still Google's TEST units until an Android app is added in AdMob
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
  },
};

const GAMES_BETWEEN_INTERSTITIALS = 3;
const MIN_MS_BETWEEN_INTERSTITIALS = 3 * 60 * 1000;

const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
// iOS uses live ads. Register your own phone under AdMob > Settings > Test devices
// so you see test ads on it and never tap live ones.
const USE_TEST_ADS = platform !== 'ios';
const native = platform === 'ios' || platform === 'android';
const units = IDS[platform] || {};

let ready = false;
let gamesSinceAd = 0;
let lastAdAt = 0;
let interstitialLoaded = false;

function setBannerSpace(px) {
  document.documentElement.style.setProperty('--ad-top', px + 'px');
}

async function consentFlow() {
  try {
    const info = await AdMob.requestConsentInfo();
    if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) {
      await AdMob.showConsentForm();
    }
  } catch (e) { console.warn('[ads] consent', e); }

  if (platform === 'ios') {
    try {
      const t = await AdMob.trackingAuthorizationStatus();
      if (t.status === 'notDetermined') await AdMob.requestTrackingAuthorization();
    } catch (e) { console.warn('[ads] ATT', e); }
  }
}

async function showBanner() {
  AdMob.addListener(BannerAdPluginEvents.SizeChanged, (s) => setBannerSpace(s.height || 0));
  AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => setBannerSpace(0));
  await AdMob.showBanner({
    adId: units.banner,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.TOP_CENTER,
    margin: 0,
    isTesting: USE_TEST_ADS,
  });
}

async function preloadInterstitial() {
  try {
    await AdMob.prepareInterstitial({ adId: units.interstitial, isTesting: USE_TEST_ADS });
    interstitialLoaded = true;
  } catch (e) { interstitialLoaded = false; }
}

async function start() {
  if (!native) return; // website build: no AdMob, web ad slots stay as they are
  document.documentElement.classList.add('in-app');
  await consentFlow();
  await AdMob.initialize({ initializeForTesting: USE_TEST_ADS });
  ready = true;
  try { await showBanner(); } catch (e) { console.warn('[ads] banner', e); }
  preloadInterstitial();
}

// Called by the game after the result screen is dismissed.
async function gameOver() {
  if (!ready) return;
  gamesSinceAd++;
  const now = Date.now();
  if (gamesSinceAd < GAMES_BETWEEN_INTERSTITIALS) return;
  if (now - lastAdAt < MIN_MS_BETWEEN_INTERSTITIALS) return;
  if (!interstitialLoaded) { preloadInterstitial(); return; }
  try {
    interstitialLoaded = false;
    await AdMob.showInterstitial();
    gamesSinceAd = 0;
    lastAdAt = Date.now();
  } catch (e) { console.warn('[ads] interstitial', e); }
  preloadInterstitial();
}

window.AYHAds = { gameOver };
start();
