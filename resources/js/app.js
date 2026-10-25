import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createApp, h } from 'vue';
import { ZiggyVue } from '../../vendor/tightenco/ziggy';
import AdminLayout from './Layouts/AdminLayout.vue';
import EmployeeLayout from './Layouts/EmployeeLayout.vue';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        const page = await resolvePageComponent(
            `./Pages/${name}.vue`,
            import.meta.glob('./Pages/**/*.vue'),
        );
        if (page.default.layout === undefined) {
            if (name.startsWith('Admin/')) {
                page.default.layout = AdminLayout;
            } else if (name.startsWith('Employee/')) {
                page.default.layout = EmployeeLayout;
            }
        }
        return page;
    },
    setup({ el, App, props, plugin }) {
        return createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(ZiggyVue)
            .mount(el);
    },
    progress: {
        delay: 500,
        color: '#2563eb',
        includeCSS: true,
        showSpinner: false,
    },
});
