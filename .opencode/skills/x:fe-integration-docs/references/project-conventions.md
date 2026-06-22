# Project Conventions for FE Integration Docs

Project-specific patterns that MUST be followed when generating docs.

## Stack

- Backend: Laravel 12, PHP 8.3, MySQL 8
- Frontend: Inertia.js v3, React 19.2, Vite 7
- UI: Ant Design v6 (tables, forms, modals, drawers) + shadcn/ui (buttons, inputs, cards)
- Forms: react-hook-form + Zod v4 via `@/Components/Form`
- i18n: i18next (Japanese `ja`, English `en`)
- Icons: Lucide React

## Architecture

```
Controller -> Service (Contract) -> Repository -> Model
```

- Controllers: HTTP handling + FormRequest validation + Inertia responses. No business logic.
- Multi-guard auth: `admin`, `agent`, `candidate` with 2FA middleware.

## Form Submission Pattern

NEVER use Inertia's `useForm` or `<Form>`. Always use project's form components:

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, FormInput } from '@/Components/Form';
import { router } from '@inertiajs/react';

const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: { /* ... */ },
});

const onSubmit = (data) => {
    router.post(route('route.name'), data, {
        onSuccess: () => message.success(flash.message),
        onError: (errors) => {
            Object.keys(errors).forEach((key) => {
                methods.setError(key, { message: errors[key] });
            });
        },
    });
};
```

## Error Mapping

Laravel returns dotted keys (e.g., `jp.employment_job_id`). Two patterns exist:

**Pattern A — react-hook-form (most pages):**
```js
onError: (errors) => {
    Object.keys(errors).forEach((key) => {
        methods.setError(key, { message: errors[key] });
    });
}
```

**Pattern B — Ant Design Form (legacy/employment pages):**
Convert dots to underscores for Ant Design form field names:
```
jp.employment_job_id → jp_employment_job_id
```

Document which pattern the target page uses.

## Flash Messages

```js
// Success flash
usePage().props.flash.message  // e.g., "企業を登録しました"

// System error flash
usePage().props.errors.message // e.g., "エラーが発生しました"
```

## Validation Messages

Extract from:
- `lang/ja/validation.php` — standard messages
- `lang/ja/validation.php` `attributes` key — field label translations
- FormRequest `messages()` method — custom overrides

Always include the **exact Japanese string** in the doc.

## Inertia Prop Types

Use these type annotations:

```
string | null        — nullable string
number | null        — nullable number
0 | 1 | null         — boolean-like integer
boolean              — true/false
number[]             — integer array
Array<{ id, name }>  — typed object array
Record<string, string> — key-value map
MediaObject | null   — Spatie media library object
```

## Authorization Docs

When a Policy exists, include a role table:

```markdown
| Role | Can Perform? |
|---|---|
| Super Admin | ✅ Yes |
| Editor Admin | ✅ Yes |
| Viewer Admin | ❌ No |
```

## Route Naming

- Admin routes: `admin.<resource>.<action>` (e.g., `admin.enterprises.store`)
- Agent routes: `agent.<resource>.<action>`
- Candidate routes: `candidate.<resource>.<action>`

## Language Key Gotcha

Employment data uses `jp` and `vi` as language keys in the payload and props. The backend validation references these as `jp.*` and `vi.*`. Do NOT use `ja` for Japanese — use `jp`.

## Partial Reload Patterns

```js
// Tab switch
router.get(url, { tab: 'tabName' }, {
    only: ['tabProp', 'tab'],
    preserveState: false,
    preserveScroll: true,
});

// After CRUD action
router.reload({ only: ['tabProp', 'flash', 'tab'] });
```

## File Paths in Docs

Always include:
- Controller: `app/Http/Controllers/<Portal>/<Feature>/<Controller>.php`
- Form Request: `app/Http/Requests/<Portal>/<Feature>/<Request>.php`
- Service: `app/Services/<Service>.php`
- Policy: `app/Policies/<Policy>.php` (if exists)
- Frontend page: `resources/js/Pages/<Portal>/<Feature>/<Page>.jsx`
- Hook: `resources/js/hooks/<scope>/<hook>.js` (if exists)
