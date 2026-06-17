### Front end rules
- You MUST use `inertia-react-development` skill to write the code in FE
- Always use tailwind class
- DO NOT hardcode text, using i18n instead
- Search and prefer use reuseable components `@resources/js/Components` before make new components
- Read `@resources/js/Components/Form/README.md` if you need create a form, then decided to how you write the form component
- Before you write any code in front-end, make sure you always read figma nodes (if have) again to know spacing, padding, margin..
- 1 source of truth i18n, define on `lang` folder (BE) and then run
```php
php artisan i18n:generate
```
to migrate to FE
- Find matching FE integrate doc in `docs/fe-integrations` first, if existed, that thing can help you implement FE integrate with BE exactly