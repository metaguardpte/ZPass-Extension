import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enUs from './locales/en-us'
import deDe from './locales/de-de'
import esEs from './locales/es-es'
import frFr from './locales/fr-fr'
import itIt from './locales/it-it'
import jaJp from './locales/ja-jp'
import koKr from './locales/ko-kr'
import msMy from './locales/ms-my'
import ptPt from './locales/pt-pt'
import thTh from './locales/th-th'
import viVn from './locales/vi-vn'
import zhCn from './locales/zh-cn'
import zhTw from './locales/zh-tw'

const resources = {
    en: {
        translation: enUs,
    },
    de: {
        translation: deDe,
    },
    es: {
        translation: esEs,
    },
    fr: {
        translation: frFr,
    },
    it: {
        translation: itIt,
    },
    ja: {
        translation: jaJp,
    },
    ko: {
        translation: koKr,
    },
    ms: {
        translation: msMy,
    },
    pt: {
        translation: ptPt,
    },
    th: {
        translation: thTh,
    },
    vi: {
        translation: viVn,
    },
    tw: {
        translation: zhTw,
    },
    zh: {
        translation: zhCn,
    },
}

i18n.use(initReactI18next).init({
    resources,
    fallbackLng: 'en',
    lng: 'en',
})

export default i18n
