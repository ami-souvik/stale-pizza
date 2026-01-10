export const APP_ROUTES = {
    data: (appId: string) => `/app/${appId}/data`,
    form: (appId: string) => `/app/${appId}/form`,
};

export const navItems = [
    { id: "data", label: "Data", getHref: APP_ROUTES.data },
    { id: "form", label: "Form", getHref: APP_ROUTES.form },
];