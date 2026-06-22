---
name: x:inertia-react-development
description: "Develops Inertia.js v2 React client-side applications. Activates when creating React pages, forms, or navigation; using <Link>, <Form>, useForm, or router; working with deferred props, prefetching, or polling; or when user mentions React with Inertia, React pages, React forms, or React navigation."
license: MIT
metadata:
    author: laravel
---

# Inertia React Development

## Documentation

Use `search-docs` for detailed Inertia v2 React patterns and documentation.

## Basic Usage

### Page Components Location

React page components should be placed in the `resources/js/Pages` directory.

### Page Component Structure

<!-- Basic React Page Component -->

```react
export default function UsersIndex({ users }) {
    return (
        <div>
            <h1>Users</h1>
            <ul>
                {users.map(user => <li key={user.id}>{user.name}</li>)}
            </ul>
        </div>
    )
}
```

## Client-Side Navigation

### Basic Link Component

Use `<Link>` for client-side navigation instead of traditional `<a>` tags:

<!-- Inertia React Navigation -->

```react
import { Link, router } from '@inertiajs/react'

<Link href="/">Home</Link>
<Link href="/users">Users</Link>
<Link href={`/users/${user.id}`}>View User</Link>
```

### Link with Method

<!-- Link with POST Method -->

```react
import { Link } from '@inertiajs/react'

<Link href="/logout" method="post" as="button">
    Logout
</Link>
```

### Prefetching

Prefetch pages to improve perceived performance:

<!-- Prefetch on Hover -->

```react
import { Link } from '@inertiajs/react'

<Link href="/users" prefetch>
    Users
</Link>
```

### Programmatic Navigation

<!-- Router Visit -->

```react
import { router } from '@inertiajs/react'

function handleClick() {
    router.visit('/users')
}

// Or with options
router.visit('/users', {
    method: 'post',
    data: { name: 'John' },
    onSuccess: () => console.log('Success!'),
})
```

## Form Handling

This project uses **Reusable Form Components** (`@/Components/Form`) built on **React Hook Form + Ant Design** instead of Inertia's `<Form>` or `useForm`. Do NOT use `import { Form, useForm } from '@inertiajs/react'` for forms. Always use the project's Form components.

### Basic Form (Recommended)

<!-- Basic Form with FormProvider -->

```react
import { useForm } from 'react-hook-form';
import { FormProvider, FormInput, FormSelect } from '@/Components/Form';
import { router } from '@inertiajs/react';
import { Button, message } from 'antd';

export default function CreateUser() {
    const methods = useForm({
        defaultValues: {
            name: '',
            email: '',
            role: '',
        },
    });

    const onSubmit = (data) => {
        router.post('/users', data, {
            onSuccess: () => message.success('User created!'),
            onError: (errors) => {
                Object.keys(errors).forEach((key) => {
                    methods.setError(key, { message: errors[key] });
                });
            },
        });
    };

    return (
        <FormProvider methods={methods} onSubmit={onSubmit}>
            <FormInput
                name="name"
                label="Name"
                rules={{ required: 'Name is required' }}
                placeholder="Enter name"
            />

            <FormInput
                name="email"
                label="Email"
                rules={{
                    required: 'Email is required',
                    pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email format',
                    },
                }}
                placeholder="Enter email"
            />

            <FormSelect
                name="role"
                label="Role"
                rules={{ required: 'Role is required' }}
                options={[
                    { label: 'Admin', value: 'admin' },
                    { label: 'User', value: 'user' },
                ]}
                placeholder="Select a role"
            />

            <Button type="primary" htmlType="submit" loading={methods.formState.isSubmitting}>
                Create User
            </Button>
        </FormProvider>
    );
}
```

### Available Form Components

All components are imported from `@/Components/Form`:

| Component         | Description                                                           |
| ----------------- | --------------------------------------------------------------------- |
| `FormProvider`    | Wraps form with React Hook Form context. Props: `methods`, `onSubmit` |
| `FormInput`       | Text input (text, password, email, etc.)                              |
| `FormTextArea`    | Multi-line text input                                                 |
| `FormSelect`      | Dropdown select (supports `mode="multiple"` and `showSearch`)         |
| `FormCheckbox`    | Checkbox input                                                        |
| `FormDatePicker`  | Date picker (format default: `YYYY-MM-DD`)                            |
| `FormRangePicker` | Date range picker                                                     |
| `FormTimePicker`  | Time picker (format default: `HH:mm`)                                 |
| `FormRadioGroup`  | Radio button group                                                    |
| `FormSwitch`      | Toggle switch                                                         |
| `FormUpload`      | File upload                                                           |
| `FormLabel`       | Standalone label                                                      |

All components share common props: `name` (required), `label`, `rules`, `disabled`, `formItemProps`.

### Zod Schema Validation (Recommended)

Use Zod for centralized, type-safe validation instead of inline `rules`:

<!-- Zod Validation Example -->

```react
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormProvider, FormInput } from '@/Components/Form';
import { router } from '@inertiajs/react';
import { Button } from 'antd';

const userSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Min 8 characters'),
});

export default function CreateUser() {
    const methods = useForm({
        resolver: zodResolver(userSchema),
        defaultValues: { name: '', email: '', password: '' },
    });

    const onSubmit = (data) => {
        router.post('/users', data, {
            onError: (errors) => {
                Object.keys(errors).forEach((key) => {
                    methods.setError(key, { message: errors[key] });
                });
            },
        });
    };

    return (
        <FormProvider methods={methods} onSubmit={onSubmit}>
            {/* No rules prop needed - Zod handles validation */}
            <FormInput name="name" label="Name" />
            <FormInput name="email" label="Email" />
            <FormInput name="password" label="Password" type="password" />

            <Button type="primary" htmlType="submit" loading={methods.formState.isSubmitting}>
                Create User
            </Button>
        </FormProvider>
    );
}
```

### Edit Form with Existing Data

<!-- Edit Form with Inertia Props -->

```react
import { useForm } from 'react-hook-form';
import { FormProvider, FormInput, FormSelect } from '@/Components/Form';
import { router } from '@inertiajs/react';
import { Button, message } from 'antd';

export default function EditUser({ user }) {
    const methods = useForm({
        defaultValues: {
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });

    const onSubmit = (data) => {
        router.put(`/users/${user.id}`, data, {
            onSuccess: () => message.success('User updated!'),
            onError: (errors) => {
                Object.keys(errors).forEach((key) => {
                    methods.setError(key, { message: errors[key] });
                });
            },
        });
    };

    return (
        <FormProvider methods={methods} onSubmit={onSubmit}>
            <FormInput name="name" label="Name" />
            <FormInput name="email" label="Email" />
            <FormSelect
                name="role"
                label="Role"
                options={[
                    { label: 'Admin', value: 'admin' },
                    { label: 'User', value: 'user' },
                ]}
            />

            <Button
                type="primary"
                htmlType="submit"
                loading={methods.formState.isSubmitting}
                disabled={!methods.formState.isDirty}
            >
                Update User
            </Button>
        </FormProvider>
    );
}
```

### Server-Side Error Handling Pattern

Always map Inertia server errors back to React Hook Form:

```react
const onSubmit = (data) => {
    router.post(route('users.store'), data, {
        onError: (errors) => {
            Object.keys(errors).forEach((key) => {
                methods.setError(key, { message: errors[key] });
            });
        },
    });
};
```

### Accessing Form Context in Child Components

```react
import { useFormContext } from 'react-hook-form';

function FormFooter() {
    const { watch, reset, formState: { isDirty, isSubmitting } } = useFormContext();

    return (
        <div>
            <Button onClick={() => reset()}>Reset</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting} disabled={!isDirty}>
                Save
            </Button>
        </div>
    );
}
```

## Inertia v2 Features

### Deferred Props

Use deferred props to load data after initial page render:

<!-- Deferred Props with Empty State -->

```react
export default function UsersIndex({ users }) {
    // users will be undefined initially, then populated
    return (
        <div>
            <h1>Users</h1>
            {!users ? (
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            ) : (
                <ul>
                    {users.map(user => (
                        <li key={user.id}>{user.name}</li>
                    ))}
                </ul>
            )}
        </div>
    )
}
```

### Polling

Use the `usePoll` hook to automatically refresh data at intervals. It handles cleanup on unmount and throttles polling when the tab is inactive.

<!-- Basic Polling -->

```react
import { usePoll } from '@inertiajs/react'

export default function Dashboard({ stats }) {
    usePoll(5000)

    return (
        <div>
            <h1>Dashboard</h1>
            <div>Active Users: {stats.activeUsers}</div>
        </div>
    )
}
```

<!-- Polling With Request Options and Manual Control -->

```react
import { usePoll } from '@inertiajs/react'

export default function Dashboard({ stats }) {
    const { start, stop } = usePoll(5000, {
        only: ['stats'],
        onStart() {
            console.log('Polling request started')
        },
        onFinish() {
            console.log('Polling request finished')
        },
    }, {
        autoStart: false,
        keepAlive: true,
    })

    return (
        <div>
            <h1>Dashboard</h1>
            <div>Active Users: {stats.activeUsers}</div>
            <button onClick={start}>Start Polling</button>
            <button onClick={stop}>Stop Polling</button>
        </div>
    )
}
```

- `autoStart` (default `true`) — set to `false` to start polling manually via the returned `start()` function
- `keepAlive` (default `false`) — set to `true` to prevent throttling when the browser tab is inactive

### WhenVisible (Infinite Scroll)

Load more data when user scrolls to a specific element:

<!-- Infinite Scroll with WhenVisible -->

```react
import { WhenVisible } from '@inertiajs/react'

export default function UsersList({ users }) {
    return (
        <div>
            {users.data.map(user => (
                <div key={user.id}>{user.name}</div>
            ))}

            {users.next_page_url && (
                <WhenVisible
                    data="users"
                    params={{ page: users.current_page + 1 }}
                    fallback={<div>Loading more...</div>}
                />
            )}
        </div>
    )
}
```

## Common Pitfalls

- Using traditional `<a>` links instead of Inertia's `<Link>` component (breaks SPA behavior)
- Forgetting to add loading states (skeleton screens) when using deferred props
- Not handling the `undefined` state of deferred props before data loads
- Using Inertia's `<Form>` or `useForm` from `@inertiajs/react` instead of the project's `@/Components/Form` components
- Forgetting to map server-side errors back to React Hook Form via `methods.setError()` in `onError` callback
