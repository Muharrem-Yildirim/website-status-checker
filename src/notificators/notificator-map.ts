const notificatorMap = {
	telegram: () => import("../notificators/telegram"),
	email: () => import("../notificators/email"),
	webhook: () => import("../notificators/webhook"),
	discord: () => import("../notificators/discord"),
};

export default notificatorMap;
