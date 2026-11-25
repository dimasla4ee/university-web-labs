(() => {
    const STORAGE_KEY = 'a24-film-collection-state';
    const CONTACT_FIELDS = ['name', 'phone', 'email', 'message'];

    const emptyState = () => ({
        version: 1,
        cart: [],
        contactDraft: {},
    });

    const cleanCart = (entries) => {
        if (!Array.isArray(entries)) return [];

        return entries
            .filter((entry) => entry && typeof entry.id === 'string')
            .map((entry) => ({
                id: entry.id,
                quantity: Math.max(1, Math.min(99, Math.floor(Number(entry.quantity) || 1))),
            }))
            .filter((entry) => entry.id.length > 0);
    };

    const cleanDraft = (draft) => {
        if (!draft || typeof draft !== 'object' || Array.isArray(draft)) return {};

        return CONTACT_FIELDS.reduce((result, field) => {
            if (typeof draft[field] === 'string') {
                result[field] = draft[field].slice(0, field === 'message' ? 500 : 254);
            }
            return result;
        }, {});
    };

    const readState = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return emptyState();

            const parsed = JSON.parse(stored);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                return emptyState();
            }

            return {
                version: 1,
                cart: cleanCart(parsed.cart),
                contactDraft: cleanDraft(parsed.contactDraft),
            };
        } catch {
            return emptyState();
        }
    };

    let state = readState();

    const persist = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            return true;
        } catch {
            return false;
        }
    };

    window.FilmAppStorage = Object.freeze({
        getCart() {
            return state.cart.map((entry) => ({...entry}));
        },

        setCart(entries) {
            state.cart = cleanCart(entries);
            persist();
        },

        getContactDraft() {
            return {...state.contactDraft};
        },

        setContactDraft(draft) {
            state.contactDraft = cleanDraft(draft);
            persist();
        },

        clearContactDraft() {
            state.contactDraft = {};
            persist();
        },
    });
})();
