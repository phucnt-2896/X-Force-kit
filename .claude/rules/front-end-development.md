# Front-End Development Rules

## Front-End Rules

- You must use `x:inertia-react-development` skill to write front-end code.
- Always use Tailwind classes.
- Do not hardcode text. Use i18n instead.
- Search and prefer reusable components under `@resources/js/Components` before creating new ones.
- Read `@resources/js/Components/Form/README.md` if you need to create a form, then decide how to write the form component.
<HARD_GATE>
- **IMPORTANT** HARD GATE: If a Figma URL/node exists, you MUST read the design from Figma MCP before implementing UI. If `figma_get_design_context` says the design is too large, incomplete, truncated, or instructs you to read sublayers/nodes in more detail, you MUST stop and continue reading the required child nodes until the UI structure is fully clear. You MUST NOT guess, simplify, normalize, or "translate" the UI into a generic pattern before reading the detailed nodes. If the detailed nodes still do not provide enough clarity, stop and report exactly what is still unclear instead of implementing from assumption.

Every UI task must pass visual validation.

For every implemented screen:
0. Invoke `x:browser-testing-with-devtools` & `x:local-browser-login-2fa` skills to run the visual validation process.
1. Capture Figma screenshot.
2. Capture browser screenshot.
3. Compare them.
4. List visual differences.
5. Fix differences.
6. Repeat until major visual differences are gone.
</HARD_GATE>
- 1 source of truth i18n, define on `lang` folder (BE) and then run
- Keep one source of truth for i18n in the `lang` folder on the backend, then run:

```php
php artisan i18n:generate
```

- Check `docs/fe-integrations` for a matching FE integration doc before implementing FE/BE integration details.
