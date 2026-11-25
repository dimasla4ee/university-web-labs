export const currency = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});

export const makeElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
};

export const makeButton = (className, text, action, productId) => {
    const button = makeElement('button', className, text);
    button.type = 'button';
    button.dataset.cartAction = action;
    if (productId) button.dataset.productId = productId;
    return button;
};

export const makeIconButton = (className, action, {icon, label, productId} = {}) => {
    const button = document.createElement('button');
    const ICON_BASE = new URL('../resources/icons/', import.meta.url);
    button.type = 'button';
    button.className = className;
    button.dataset.cartAction = action;
    if (productId) button.dataset.productId = productId;
    if (label) button.setAttribute('aria-label', label);

    const iconElement = document.createElement('span');
    iconElement.className = 'ticket-icon';
    iconElement.setAttribute('aria-hidden', 'true');
    iconElement.style.setProperty('--icon', `url("${new URL(icon, ICON_BASE).href}")`);
    button.append(iconElement);

    return button;
};

export const ticketWord = (count) => {
    const lastTwoDigits = count % 100;
    const lastDigit = count % 10;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'билетов';
    if (lastDigit === 1) return 'билет';
    if (lastDigit >= 2 && lastDigit <= 4) return 'билета';
    return 'билетов';
};

export const createCartDialog = () => {
    const dialog = document.createElement('dialog');
    dialog.className = 'ticket-dialog';
    dialog.id = 'ticket-cart-dialog';
    dialog.setAttribute('aria-labelledby', 'ticket-dialog-title');
    dialog.setAttribute('aria-modal', 'true');

    const header = makeElement('div', 'ticket-dialog__header');
    const headingGroup = makeElement('div');
    headingGroup.append(
        makeElement('h2', 'ticket-dialog__title', 'Ваши билеты'),
    );
    headingGroup.lastElementChild.id = 'ticket-dialog-title';

    const closeButton = makeIconButton('ticket-dialog__close', 'close', {
        icon: 'close_24dp.svg',
        label: 'Закрыть корзину',
    });
    header.append(headingGroup, closeButton);

    const body = makeElement('div', 'ticket-dialog__body');
    const list = makeElement('ul', 'ticket-cart__list');
    list.setAttribute('aria-label', 'Билеты в корзине');
    body.append(list);

    const footer = makeElement('div', 'ticket-dialog__footer');
    const totalGroup = makeElement('div', 'ticket-cart__total-group');
    totalGroup.append(
        makeElement('span', 'ticket-cart__total-label', 'Итого'),
        makeElement('strong', 'ticket-cart__total', currency.format(0)),
    );
    totalGroup.lastElementChild.id = 'ticket-cart-total';
    const continueButton = makeButton('ticket-dialog__continue', 'Продолжить покупку', 'close');
    footer.append(totalGroup, continueButton);

    dialog.append(header, body, footer);
    document.body.append(dialog);

    return {dialog, list, total: totalGroup.lastElementChild};
};

export const renderCart = ({cartDialog, cartCount, cartTrigger, headerNotch, films, cart}) => {
    const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const hasItems = quantity > 0;
    const notch = headerNotch ?? cartTrigger.closest('.header__notch');

    if (hasItems) {
        cartTrigger.disabled = false;
        cartTrigger.removeAttribute('aria-hidden');
    } else {
        cartTrigger.disabled = true;
        cartTrigger.setAttribute('aria-hidden', 'true');
    }

    cartCount.textContent = String(quantity);
    cartTrigger.setAttribute(
        'aria-label',
        hasItems ? `Открыть корзину: ${quantity} ${ticketWord(quantity)}` : 'Открыть корзину билетов',
    );
    cartTrigger.classList.toggle('header__cart--has-items', hasItems);
    notch?.classList.toggle('has-cart', hasItems);

    cartDialog.list.replaceChildren();
    let total = 0;

    if (cart.length === 0) {
        cartDialog.list.append(makeElement(
            'li',
            'ticket-cart__empty',
            'Билетов пока нет. Добавьте билет в карточке фильма.',
        ));
    }

    cart.forEach(({id, quantity: itemQuantity}) => {
        const film = films.get(id);
        if (!film) return;

        total += film.price * itemQuantity;

        const item = makeElement('li', 'ticket-cart__item');
        const details = makeElement('div', 'ticket-cart__info');
        details.append(
            makeElement('span', 'ticket-cart__name', film.title),
            makeElement('span', 'ticket-cart__unit-price', `${currency.format(film.price)} за билет`),
        );

        const controls = makeElement('div', 'ticket-cart__controls');
        const decrease = makeIconButton('ticket-cart__quantity-button', 'decrease', {
            icon: 'remove_24dp.svg',
            label: `Уменьшить количество билетов «${film.title}»`,
            productId: id,
        });
        decrease.disabled = itemQuantity <= 1;

        const currentQuantity = makeElement('output', 'ticket-cart__quantity', String(itemQuantity));
        currentQuantity.setAttribute('aria-label', 'Количество билетов');

        const increase = makeIconButton('ticket-cart__quantity-button', 'increase', {
            icon: 'add_24dp.svg',
            label: `Увеличить количество билетов «${film.title}»`,
            productId: id,
        });
        increase.disabled = itemQuantity >= 99;

        const remove = makeButton('ticket-cart__remove', 'Удалить', 'remove', id);
        remove.setAttribute('aria-label', `Удалить билеты «${film.title}»`);
        controls.append(decrease, currentQuantity, increase, remove);
        item.append(details, controls);
        cartDialog.list.append(item);
    });

    cartDialog.total.textContent = currency.format(total);
};

export const openCart = (dialog) => {
    if (dialog.open) return;
    if (typeof dialog.showModal === 'function') {
        dialog.showModal();
    } else {
        dialog.setAttribute('open', '');
    }
};

export const closeCart = (dialog) => {
    if (typeof dialog.close === 'function' && dialog.open) {
        dialog.close();
    } else {
        dialog.removeAttribute('open');
    }
};

export const setDialogViewportHeight = (dialog) => {
    dialog.style.setProperty('--ticket-viewport-height', `${window.innerHeight}px`);
};