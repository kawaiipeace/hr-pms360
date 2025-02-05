const cookieObj = typeof window === 'undefined' ? require('next/headers') : require('universal-cookie');

// Load your language files
import en from './public/locales/en.json';
import th from './public/locales/th.json';

const langObj: any = { en, th};

const getLang = () => {
    let lang = null;
    if (typeof window !== 'undefined') {
        // In the browser environment, use 'universal-cookie' directly.
        const cookies = new cookieObj(null, { path: '/' }); // No need for `.default` here
        lang = cookies.get('i18nextLng');
    } else {
        // In the server environment, use 'next/headers'
        const cookies = cookieObj.cookies();
        lang = cookies.get('i18nextLng')?.value;
    }
    return lang;
};

export const getTranslation = () => {
    const lang = getLang();
    const data: any = langObj[lang || 'th'];

    const t = (key: string) => {
        return data[key] ? data[key] : key;
    };

    const initLocale = (themeLocale: string) => {
        const lang = getLang();
        i18n.changeLanguage(lang || themeLocale);
    };

    const i18n = {
        language: lang,
        changeLanguage: (lang: string) => {
            // Use `universal-cookie` in the browser environment
            const cookies = new cookieObj(null, { path: '/' }); // No `.default`
            cookies.set('i18nextLng', lang);
        },
    };

    return { t, i18n, initLocale };
};
