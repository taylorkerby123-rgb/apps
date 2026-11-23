// Ate Your Homework: AdMob integration (shared by the Junk Games).
// Order on launch: GDPR consent (UMP) -> iOS tracking prompt (ATT) -> initialize -> top banner.
// Interstitial: after a finished round, at most once every 3 rounds and 3 minutes.

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
const USE_TEST_ADS = true;

const IDS = {
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
  },
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
  },
};

const ROUNDS_BETWEEN_INTERSTITIALS = 3;
const MIN_MS_BETWEEN_INTERSTITIALS = 3 * 60 * 1000;
const DELAY_AFTER_ROUND_MS = 1500; // let the player see their result first

const platform = Capacitor.getPlatform();
const native = platform === 'ios' || platform === 'android';
const units = IDS[platform] || {};

let ready = false;
let rounds = 0;
let lastAdAt = 0;
let loaded = false;
let pending = false;

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

async function preload() {
  try {
    await AdMob.prepareInterstitial({ adId: units.interstitial, isTesting: USE_TEST_ADS });
    loaded = true;
  } catch (e) { loaded = false; }
}

async function start() {
  if (!native) return;
  document.documentElement.classList.add('in-app');
  await consentFlow();
  await AdMob.initialize({ initializeForTesting: USE_TEST_ADS });
  ready = true;
  try {
    AdMob.addListener(BannerAdPluginEvents.SizeChanged, (s) => setBannerSpace(s.height || 0));
    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => setBannerSpace(0));
    await AdMob.showBanner({
      adId: units.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.TOP_CENTER,
      margin: 0,
      isTesting: USE_TEST_ADS,
    });
  } catch (e) { console.warn('[ads] banner', e); }
  preload();
}

// Called by the game when a round ends (win, loss or finished scan).
function gameOver() {
  if (!ready || pending) return;
  rounds++;
  if (rounds < ROUNDS_BETWEEN_INTERSTITIALS) return;
  if (Date.now() - lastAdAt < MIN_MS_BETWEEN_INTERSTITIALS) return;
  if (!loaded) { preload(); return; }
  pending = true;
  setTimeout(async () => {
    try {
      loaded = false;
      await AdMob.showInterstitial();
      rounds = 0;
      lastAdAt = Date.now();
    } catch (e) { console.warn('[ads] interstitial', e); }
    pending = false;
    preload();
  }, DELAY_AFTER_ROUND_MS);
}

window.AYHAds = { gameOver };
start();
