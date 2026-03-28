import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
function resolveBase() {
    var _a;
    var repository = (_a = process.env.GITHUB_REPOSITORY) === null || _a === void 0 ? void 0 : _a.split('/')[1];
    if (!repository) {
        return '/';
    }
    if (repository.endsWith('.github.io')) {
        return '/';
    }
    return "/".concat(repository, "/");
}
export default defineConfig({
    base: resolveBase(),
    plugins: [react()],
});
