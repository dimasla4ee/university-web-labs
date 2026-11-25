(() => {
    const storage = window.FilmAppStorage;
    const form = document.querySelector('#feedback-form');
    if (!storage || !form) return;

    const fields = Array.from(form.querySelectorAll('[data-validate]'));
    const fieldsByName = new Map(fields.map((field) => [field.dataset.validate, field]));
    const touched = new Set();
    const submitButton = form.querySelector('#feedback-submit');
    const status = form.querySelector('#feedback-status');
    const passwordInput = fieldsByName.get('password');
    const passwordProgress = form.querySelector('#password-strength');
    const passwordStrengthLabel = form.querySelector('#password-strength-label');

    const TEMPORARY_EMAIL_DOMAINS = new Set([
        '10minutemail.com',
        '10minutemail.net',
        'dispostable.com',
        'fakeinbox.com',
        'getnada.com',
        'guerrillamail.com',
        'guerrillamailblock.com',
        'mail.tm',
        'maildrop.cc',
        'mailinator.com',
        'moakt.com',
        'sharklasers.com',
        'temp-mail.io',
        'temp-mail.org',
        'tempmail.com',
        'throwawaymail.com',
        'trashmail.com',
        'yopmail.com',
    ]);

    const EMAIL_PATTERN = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,63}$/i;

    const passwordRules = [
        {key: 'uppercase', test: /\p{Lu}/u},
        {key: 'lowercase', test: /\p{Ll}/u},
        {key: 'number', test: /\p{Nd}/u},
        {key: 'special', test: /[\p{P}\p{S}]/u},
    ];

    const getPhoneDigits = (value, typedDialPrefix = false) => {
        const allDigits = value.replace(/\D/g, '');
        const hasExplicitCountryCode = /^\s*\+7/.test(value);
        const hasElevenDigitPrefix = allDigits.length > 10 && /^[78]/.test(allDigits);
        const hasTypedDialPrefix = typedDialPrefix && /^[78]/.test(allDigits);
        const hasCountryCode = hasExplicitCountryCode || hasElevenDigitPrefix || hasTypedDialPrefix;
        const subscriberDigits = hasCountryCode
            ? allDigits.slice(1)
            : allDigits;

        return subscriberDigits.slice(0, 10);
    };

    const formatPhoneDigits = (digits, keepCountryPrefix = false) => {
        if (!digits) return keepCountryPrefix ? '+7\u00a0(' : '';

        let formatted = `+7\u00a0(${digits.slice(0, 3)}`;
        if (digits.length >= 3) formatted += ')';
        if (digits.length > 3) formatted += `\u00a0${digits.slice(3, 6)}`;
        if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
        if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
        return formatted;
    };

    const getPhoneCountryPrefixLength = (value, typedDialPrefix = false) => {
        const allDigits = value.replace(/\D/g, '');
        if (/^\s*\+7/.test(value)) return 1;
        if (allDigits.length > 10 && /^[78]/.test(allDigits)) return 1;
        if (typedDialPrefix && /^[78]/.test(allDigits)) return 1;
        return 0;
    };

    const getCaretAfterSubscriberDigits = (formatted, digitCount) => {
        const openingParenthesis = formatted.indexOf('(');
        if (digitCount <= 0) return openingParenthesis === -1 ? formatted.length : openingParenthesis + 1;

        let seen = 0;
        for (let index = 0; index < formatted.length; index += 1) {
            if (!/\d/.test(formatted[index])) continue;
            if (index === 1) continue; // Не учитываем цифру 7 в коде страны.
            seen += 1;
            if (seen === digitCount) return index + 1;
        }

        return formatted.length;
    };

    const applyPhoneMask = (input) => {
        const previousValue = input.value;
        const allDigits = previousValue.replace(/\D/g, '');
        const hasExplicitCountryCode = /^\s*\+7/.test(previousValue);

        if (!allDigits) {
            delete input.dataset.dialPrefix;
        } else if (!hasExplicitCountryCode && allDigits.length === 1 && /^[78]$/.test(allDigits)) {
            input.dataset.dialPrefix = 'true';
        }

        const typedDialPrefix = input.dataset.dialPrefix === 'true';
        const cursorPosition = input.selectionStart ?? previousValue.length;
        const digitsBeforeCursor = previousValue.slice(0, cursorPosition).replace(/\D/g, '').length;
        const countryPrefixLength = getPhoneCountryPrefixLength(previousValue, typedDialPrefix);
        const subscriberDigitsBeforeCursor = Math.max(0, digitsBeforeCursor - countryPrefixLength);
        const digits = getPhoneDigits(previousValue, typedDialPrefix);
        const keepCountryPrefix = (hasExplicitCountryCode || typedDialPrefix) && digits.length === 0;
        const formatted = formatPhoneDigits(digits, keepCountryPrefix);

        input.value = formatted;
        if (document.activeElement === input && typeof input.setSelectionRange === 'function') {
            const newPosition = getCaretAfterSubscriberDigits(
                formatted,
                Math.min(subscriberDigitsBeforeCursor, digits.length),
            );
            input.setSelectionRange(newPosition, newPosition);
        }
    };

    const getPasswordChecks = (value) => passwordRules.reduce((checks, rule) => {
        checks[rule.key] = rule.test.test(value);
        return checks;
    }, {});

    const updatePasswordStrength = () => {
        const value = passwordInput.value;
        const checks = getPasswordChecks(value);
        const score = Object.values(checks).filter(Boolean).length;
        const labels = ['Не введён', 'Очень низкая', 'Низкая', 'Хорошая', 'Высокая'];

        passwordProgress.value = score;
        passwordProgress.setAttribute('aria-valuetext', `${score} из 4 требований`);
        passwordStrengthLabel.textContent = `${labels[score]} · ${score}/4`;

        form.querySelectorAll('[data-password-rule]').forEach((ruleElement) => {
            ruleElement.dataset.met = String(Boolean(checks[ruleElement.dataset.passwordRule]));
        });
    };

    const getValidationError = (field) => {
        const value = field.value;
        const trimmedValue = value.trim();

        switch (field.dataset.validate) {
            case 'name': {
                const length = Array.from(trimmedValue).length;
                if (!trimmedValue) return 'Введите имя.';
                if (length < 3) return 'Имя должно содержать не менее 3 символов.';
                if (length > 50) return 'Имя должно содержать не более 50 символов.';
                if (!/^[\p{L} ]+$/u.test(trimmedValue)) return 'Используйте только буквы и пробелы.';
                return '';
            }

            case 'phone': {
                const digits = getPhoneDigits(value);
                if (!digits) return 'Введите телефон.';
                if (digits.length !== 10) return 'Введите все 10 цифр номера.';
                return '';
            }

            case 'email': {
                if (!trimmedValue) return 'Введите email.';
                if (!EMAIL_PATTERN.test(trimmedValue)) return 'Введите корректный адрес email.';

                const domain = trimmedValue.slice(trimmedValue.lastIndexOf('@') + 1).toLowerCase().replace(/\.$/, '');
                const isTemporaryDomain = Array.from(TEMPORARY_EMAIL_DOMAINS).some(
                    (blockedDomain) => domain === blockedDomain || domain.endsWith(`.${blockedDomain}`),
                );
                if (isTemporaryDomain) return 'Временные почтовые адреса не принимаются.';
                return '';
            }

            case 'password': {
                if (!value) return 'Введите пароль.';
                const checks = getPasswordChecks(value);
                if (Object.values(checks).some((isMet) => !isMet)) {
                    return 'Добавьте заглавную и строчную буквы, цифру и спецсимвол.';
                }
                return '';
            }

            case 'message':
                if (value.length > 500) return 'Вопрос должен быть не длиннее 500 символов.';
                return '';

            default:
                return '';
        }
    };

    const updateFieldFeedback = (field) => {
        const name = field.dataset.validate;
        const error = getValidationError(field);
        const errorElement = form.querySelector(`[data-error-for="${name}"]`);
        const shouldShowError = touched.has(name) && Boolean(error);

        field.setAttribute('aria-invalid', String(shouldShowError));
        if (errorElement) errorElement.textContent = shouldShowError ? error : '';
        return !error;
    };

    const updateSubmitState = () => {
        const allValid = fields.every((field) => !getValidationError(field));
        submitButton.disabled = !allValid;
    };

    const getContactDraft = () => ({
        name: fieldsByName.get('name').value,
        phone: fieldsByName.get('phone').value,
        email: fieldsByName.get('email').value,
        message: fieldsByName.get('message').value,
    });

    const debounce = (callback, delay) => {
        let timeoutId;
        let latestArgs = [];

        const debounced = (...args) => {
            latestArgs = args;
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                timeoutId = undefined;
                callback(...latestArgs);
            }, delay);
        };

        debounced.flush = () => {
            if (timeoutId === undefined) return;
            window.clearTimeout(timeoutId);
            timeoutId = undefined;
            callback(...latestArgs);
        };

        debounced.cancel = () => {
            window.clearTimeout(timeoutId);
            timeoutId = undefined;
        };

        return debounced;
    };

    const saveDraft = debounce(() => storage.setContactDraft(getContactDraft()), 180);

    const draft = storage.getContactDraft();
    ['name', 'phone', 'email', 'message'].forEach((name) => {
        const field = fieldsByName.get(name);
        if (field && typeof draft[name] === 'string') field.value = draft[name];
    });
    applyPhoneMask(fieldsByName.get('phone'));

    fields.forEach(updateFieldFeedback);
    updatePasswordStrength();
    updateSubmitState();

    form.addEventListener('input', (event) => {
        const field = event.target.closest('[data-validate]');
        if (!field || !form.contains(field)) return;

        if (field.dataset.validate === 'phone') applyPhoneMask(field);
        touched.add(field.dataset.validate);
        updateFieldFeedback(field);
        if (field === passwordInput) updatePasswordStrength();
        updateSubmitState();
        status.textContent = '';
        saveDraft();
    });

    form.addEventListener('blur', (event) => {
        const field = event.target.closest('[data-validate]');
        if (!field || !form.contains(field)) return;

        if (field.dataset.validate === 'phone') applyPhoneMask(field);
        touched.add(field.dataset.validate);
        updateFieldFeedback(field);
        if (field === passwordInput) updatePasswordStrength();
        updateSubmitState();
        saveDraft.flush();
    }, true);

    window.addEventListener('pagehide', () => saveDraft.flush());

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const invalidField = fields.find((field) => getValidationError(field));
        if (invalidField) {
            touched.add(invalidField.dataset.validate);
            updateFieldFeedback(invalidField);
            invalidField.focus();
            updateSubmitState();
            return;
        }

        saveDraft.cancel();
        storage.clearContactDraft();
        form.reset();
        touched.clear();
        fields.forEach(updateFieldFeedback);
        updatePasswordStrength();
        updateSubmitState();
        status.textContent = 'Форма прошла проверку. В демо-режиме данные не отправляются на сервер.';
    });
})();
