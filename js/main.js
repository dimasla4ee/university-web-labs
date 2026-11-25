import {
    createCartDialog,
    renderCart,
    openCart,
    closeCart,
    setDialogViewportHeight,
} from './ui.js';

const storage = window.FilmAppStorage;
const catalog = document.querySelector('.cards');
const cartTrigger = document.querySelector('#cart-trigger');
const cartCount = document.querySelector('#cart-count');

const films = new Map([
    ['see-everything', {title: 'Увидеть всё', price: 450}],
    ['misty-green', {title: 'Мисти Грин', price: 480}],
    ['primetime', {title: 'Праймтайм', price: 520}],
    ['onslaught', {title: 'Натиск', price: 500}],
    ['backrooms', {title: 'Закулисье реальности', price: 460}],
    ['mother-mary', {title: 'Мать Мария', price: 510}],
]);

const debounce = (callback, delay) => {
    let timeoutId;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => callback(...args), delay);
    };
};

const init = () => {
    if (!storage || !catalog || !cartTrigger || !cartCount) return;

    const cartDialog = createCartDialog();
    cartTrigger.setAttribute('aria-controls', cartDialog.dialog.id);

    const initialItems = storage.getCart();
    const initialById = new Map();
    initialItems.forEach((item) => {
        if (!films.has(item.id)) return;
        const previousQuantity = initialById.get(item.id) || 0;
        initialById.set(item.id, Math.min(99, previousQuantity + item.quantity));
    });
    let cart = Array.from(initialById, ([id, quantity]) => ({id, quantity}));

    const render = () => renderCart({ cartDialog, cartCount, cartTrigger, films, cart });
    const saveCart = () => {
        storage.setCart(cart);
        render();
    };

    catalog.addEventListener('click', (event) => {
        const button = event.target.closest('[data-cart-add]');
        if (!button || !catalog.contains(button)) return;

        const id = button.dataset.productId;
        if (!films.has(id)) return;

        const current = cart.find((item) => item.id === id);
        if (current) {
            cart = cart.map((item) => item.id === id
                ? {...item, quantity: Math.min(99, item.quantity + 1)}
                : item);
        } else {
            cart = [...cart, {id, quantity: 1}];
        }

        saveCart();
        openCart(cartDialog.dialog);
    });

    cartTrigger.addEventListener('click', () => openCart(cartDialog.dialog));

    cartDialog.dialog.addEventListener('click', (event) => {
        if (event.target === cartDialog.dialog) {
            closeCart(cartDialog.dialog);
            return;
        }

        const button = event.target.closest('[data-cart-action]');
        if (!button || !cartDialog.dialog.contains(button)) return;

        const {cartAction: action, productId} = button.dataset;
        if (action === 'close') {
            closeCart(cartDialog.dialog);
            return;
        }

        if (action === 'remove') {
            cart = cart.filter((item) => item.id !== productId);
        } else if (action === 'increase') {
            cart = cart.map((item) => item.id === productId
                ? {...item, quantity: Math.min(99, item.quantity + 1)}
                : item);
        } else if (action === 'decrease') {
            cart = cart.map((item) => item.id === productId
                ? {...item, quantity: Math.max(1, item.quantity - 1)}
                : item);
        } else {
            return;
        }

        saveCart();
    });

    const onResize = debounce(() => setDialogViewportHeight(cartDialog.dialog), 140);
    window.addEventListener('resize', onResize, {passive: true});
    setDialogViewportHeight(cartDialog.dialog);

    render();
};

init();