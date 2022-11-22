
import { _, dictionary, locale } from "svelte-i18n";

function setupI18n({ withLocale: _locale } = { withLocale: "en" }) {
    dictionary.set({
        en: {
            home: {
                title: "Taiko Bridge",
                selectToken: "Select Token"
            }
        }
    })

    locale.set(_locale);
}

export { _, setupI18n };