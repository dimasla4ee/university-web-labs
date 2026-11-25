(() => {
    const storage = window.FilmAppStorage;
    const catalog = document.querySelector('.cards');
    const cartTrigger = document.querySelector('#cart-trigger');
    const cartCount = document.querySelector('#cart-count');

    if (!storage || !catalog || !cartTrigger || !cartCount) return;

    const films = new Map([
        ['see-everything', {title: 'Увидеть всё', price: 450}],
        ['misty-green', {title: 'Мисти Грин', price: 480}],
        ['primetime', {title: 'Праймтайм', price: 520}],
        ['onslaught', {title: 'Натиск', price: 500}],
        ['backrooms', {title: 'Закулисье реальности', price: 460}],
        ['mother-mary', {title: 'Мать Мария', price: 510}],
    ]);

    const currency = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    });

    const makeElement = (tagName, className, text) => {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    };

    const makeButton = (className, text, action, productId) => {
        const button = makeElement('button', className, text);
        button.type = 'button';
        button.dataset.cartAction = action;
        if (productId) button.dataset.productId = productId;
        return button;
    };

    const createCartDialog = () => {
        const dialog = document.createElement('dialog');
        dialog.className = 'ticket-dialog';
        dialog.id = 'ticket-cart-dialog';
        dialog.setAttribute('aria-labelledby', 'ticket-dialog-title');
        dialog.setAttribute('aria-modal', 'true');

        const header = makeElement('div', 'ticket-dialog__header');
        const headingGroup = makeElement('div');
        headingGroup.append(
            makeElement('span', 'ticket-dialog__eyebrow', 'Коллекция фильмов'),
            makeElement('h2', 'ticket-dialog__title', 'Ваши билеты'),
        );
        headingGroup.lastElementChild.id = 'ticket-dialog-title';

        const closeButton = makeButton('ticket-dialog__close', '×', 'close');
        closeButton.setAttribute('aria-label', 'Закрыть корзину');
        header.append(headingGroup, closeButton);

        const body = makeElement('div', 'ticket-dialog__body');
        body.append(makeElement(
            'p',
            'ticket-dialog__hint',
            'Количество билетов и итоговая сумма обновляются автоматически.',
        ));
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
        const continueButton = makeButton('ticket-dialog__continue', 'Продолжить просмотр', 'close');
        footer.append(totalGroup, continueButton);

        dialog.append(header, body, footer);
        document.body.append(dialog);

        return {
            dialog,
            list,
            total: totalGroup.lastElementChild,
        };
    };

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

    const countTickets = () => cart.reduce((sum, item) => sum + item.quantity, 0);

    const ticketWord = (count) => {
        const lastTwoDigits = count % 100;
        const lastDigit = count % 10;
        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'билетов';
        if (lastDigit === 1) return 'билет';
        if (lastDigit >= 2 && lastDigit <= 4) return 'билета';
        return 'билетов';
    };

    const renderCart = () => {
        const quantity = countTickets();
        cartCount.textContent = String(quantity);
        cartTrigger.setAttribute(
            'aria-label',
            quantity ? `Открыть корзину: ${quantity} ${ticketWord(quantity)}` : 'Открыть корзину билетов',
        );
        cartTrigger.classList.toggle('cart-trigger--has-items', quantity > 0);

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
            const decrease = makeButton('ticket-cart__quantity-button', '−', 'decrease', id);
            decrease.setAttribute('aria-label', `Уменьшить количество билетов «${film.title}»`);
            decrease.disabled = itemQuantity <= 1;

            const currentQuantity = makeElement('output', 'ticket-cart__quantity', String(itemQuantity));
            currentQuantity.setAttribute('aria-label', 'Количество билетов');

            const increase = makeButton('ticket-cart__quantity-button', '+', 'increase', id);
            increase.setAttribute('aria-label', `Увеличить количество билетов «${film.title}»`);
            increase.disabled = itemQuantity >= 99;

            const remove = makeButton('ticket-cart__remove', 'Удалить', 'remove', id);
            remove.setAttribute('aria-label', `Удалить билеты «${film.title}»`);
            controls.append(decrease, currentQuantity, increase, remove);
            item.append(details, controls);
            cartDialog.list.append(item);
        });

        cartDialog.total.textContent = currency.format(total);
    };

    const saveCart = () => {
        storage.setCart(cart);
        renderCart();
    };

    const openCart = () => {
        if (cartDialog.dialog.open) return;
        if (typeof cartDialog.dialog.showModal === 'function') {
            cartDialog.dialog.showModal();
        } else {
            cartDialog.dialog.setAttribute('open', '');
        }
    };

    const closeCart = () => {
        if (typeof cartDialog.dialog.close === 'function' && cartDialog.dialog.open) {
            cartDialog.dialog.close();
        } else {
            cartDialog.dialog.removeAttribute('open');
        }
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
        openCart();
    });

    cartTrigger.addEventListener('click', openCart);

    cartDialog.dialog.addEventListener('click', (event) => {
        if (event.target === cartDialog.dialog) {
            closeCart();
            return;
        }

        const button = event.target.closest('[data-cart-action]');
        if (!button || !cartDialog.dialog.contains(button)) return;

        const {cartAction: action, productId} = button.dataset;
        if (action === 'close') {
            closeCart();
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

    const setDialogViewportHeight = () => {
        cartDialog.dialog.style.setProperty('--ticket-viewport-height', `${window.innerHeight}px`);
    };

    const debounce = (callback, delay) => {
        let timeoutId;
        return (...args) => {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => callback(...args), delay);
        };
    };

    const onResize = debounce(setDialogViewportHeight, 140);
    window.addEventListener('resize', onResize, {passive: true});
    setDialogViewportHeight();

    renderCart();
})();
