# Doc Type Patterns

Classify backend endpoint into one of these types. Use the matching template structure.

## Type 1: CRUD Form (Create / Update)

**Triggers:** POST/PUT endpoint with FormRequest validation, redirects on success.

**Template sections:**
1. Overview table (route, method, controller, form request)
2. Backend endpoint (method, URL, auth, middleware)
3. Request body table (field, type, required, validation, example)
4. Payload example (JSON with realistic data)
5. Validation rules table (attribute, rules, Japanese messages)
6. Response handling (success redirect + flash, 422 errors, 403)
7. Authorization rules (role permission table)
8. Important FE notes

**Example docs:** `admin-create-enterprise-page.md`, `admin-enterprise-employment-template-job-info-update.md`

**Submit pattern:**
```js
router.post(route('admin.enterprises.store'), data, {
    onSuccess: () => message.success(flash.message),
    onError: (errors) => {
        Object.keys(errors).forEach((key) => {
            methods.setError(key, { message: errors[key] });
        });
    },
});
```

---

## Type 2: List / Index Page

**Triggers:** GET endpoint returning paginated data, search/filter params.

**Template sections:**
1. Overview table
2. Props contract (full JS shape with pagination meta)
3. Query params table (search, filter, page, per_page)
4. Call examples (initial load, search, paginate)
5. Tab switching pattern (if multi-tab)
6. Self-healing pattern (if needed)
7. Reading props safely (destructuring with defaults)
8. CRUD endpoint links table

**Example docs:** `admin-list-enerprise-page.md`, `master-setting-page.md`

**Pagination shape:**
```js
{
    data: Array<ItemShape>,
    meta: { total, per_page, current_page, last_page, from, to },
    links: { first, last, prev, next },
}
```

---

## Type 3: Auth Flow (Login / Password / OTP)

**Triggers:** Auth controller, login/logout/password endpoints.

**Template sections:**
1. Overview (feature description, user flow)
2. Backend endpoint (method, URL, auth requirements)
3. Request parameters table
4. Validation rules
5. Response / Inertia props (success, error objects)
6. Rate limiting & security (attempts, lockout, throttle key)
7. Error scenarios table (scenario, message, UI behavior)
8. 2FA/OTP flow (if applicable)
9. Code examples (basic form, submission, rate limit display)
10. Testing checklist

**Example docs:** `admin-login-page.md`, `change-password.md`, `force-change-password-page.md`

---

## Type 4: Modal / Drawer Action

**Triggers:** Action triggered from modal/drawer, often DELETE or quick edit.

**Template sections:**
1. Overview table
2. Trigger context (where modal opens from, parent page)
3. Request body (if any)
4. Confirmation dialog (if delete)
5. Response handling (partial reload pattern)
6. UI component tree
7. Hook details (if custom hook)

**Example docs:** `admin-agent-delete.md`, `master-setting-delete-evaluation-tag.md`

**Delete pattern:**
```js
router.delete(route('admin.resource.destroy', { id }), {
    preserveScroll: true,
    onSuccess: () => message.success(flash.message),
});
```

---

## Type 5: File Upload / Preview

**Triggers:** File upload endpoint, media management.

**Template sections:**
1. Overview table
2. Upload endpoint (multipart form data)
3. File validation rules (MIME types, max size)
4. MediaObject shape
5. Preview behavior (`can_view_directly` flag)
6. Delete endpoint (if applicable)

**Example docs:** `master-setting-naitei-template-file-upload-page.md`, `preview-file-page.md`

---

## Choosing the Right Type

| Backend Pattern | Doc Type |
|---|---|
| `store()` / `update()` with FormRequest | CRUD Form |
| `index()` / `__invoke()` with pagination | List / Index |
| `login()` / `changePassword()` | Auth Flow |
| `destroy()` in modal context | Modal Action |
| File upload with Spatie Media | File Upload |
| Multi-tab `__invoke()` with `match($tab)` | List + use tab subsections |
