src/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Landing page
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   ├── templates/
│   │   │   └── page.tsx
│   │   └── features/
│   │       └── page.tsx
│   │
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Sidebar, topbar
│   │   ├── page.tsx                 # App list
│   │   ├── apps/
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [appId]/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx         # App overview
│   │   │       ├── settings/
│   │   │       │   └── page.tsx
│   │   │       ├── objects/
│   │   │       │   └── page.tsx
│   │   │       └── builder/
│   │   │           ├── layout.tsx
│   │   │           └── page.tsx     # Field / table builder
│   │   └── billing/
│   │       └── page.tsx
│   │
│   ├── (public)/
│   │   └── share/
│   │       └── [slug]/
│   │           ├── page.tsx         # Public app view
│   │           └── loading.tsx
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts
│   │   ├── stripe/
│   │   │   └── webhook/
│   │   │       └── route.ts
│   │   └── proxy/
│   │       └── [...path]/
│   │           └── route.ts         # Optional Django proxy
│   │
│   ├── layout.tsx                   # Root layout
│   └── not-found.tsx
│
├── components/
│   ├── builder/
│   │   ├── TableBuilder/
│   │   │   ├── TableBuilder.tsx
│   │   │   ├── FieldCard.tsx
│   │   │   ├── DropIndicator.tsx
│   │   │   ├── LeftSidebar.tsx
│   │   │   ├── RightSidebar.tsx
│   │   │   └── hooks/
│   │   │       └── useDropIndicator.ts
│   │   └── ObjectTabs.tsx
│   │
│   ├── forms/
│   │   ├── FormRenderer.tsx
│   │   ├── FormField.tsx
│   │   └── FieldTypes/
│   │
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── EmptyState.tsx
│   │   └── Loader.tsx
│   │
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Topbar.tsx
│       └── WorkspaceSwitcher.tsx
│
├── lib/
│   ├── api/
│   │   ├── client.ts               # fetch wrapper
│   │   ├── apps.ts
│   │   ├── objects.ts
│   │   ├── fields.ts
│   │   └── templates.ts
│   │
│   ├── auth/
│   │   └── session.ts
│   │
│   ├── schemas/
│   │   ├── field.ts
│   │   ├── object.ts
│   │   └── app.ts
│   │
│   ├── constants/
│   │   └── fieldTypes.ts
│   │
│   └── utils/
│       ├── debounce.ts
│       ├── slugify.ts
│       └── permissions.ts
│
├── styles/
│   └── globals.css
│
└── middleware.ts
