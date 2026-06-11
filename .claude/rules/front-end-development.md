# Front-End Development Rules

## Front-End Rules

- You must use `inertia-react-development` skill to write front-end code.
- Always use Tailwind classes.
- Do not hardcode text. Use i18n instead.
- Search and prefer reusable components under `@resources/js/Components` before creating new ones.
- Read `@resources/js/Components/Form/README.md` if you need to create a form, then decide how to write the form component.
- Before writing front-end code, read the Figma design again if it exists so spacing, padding, and margin stay accurate.
- Keep one source of truth for i18n in the `lang` folder on the backend, then run:

```php
php artisan i18n:generate
```

- Check `docs/fe-integrations` for a matching FE integration doc before implementing FE/BE integration details.
