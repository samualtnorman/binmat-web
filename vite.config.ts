import type { UserConfigExport } from "vite"
import solidPlugin from "vite-plugin-solid"

export default { plugins: [ solidPlugin() ], server: { port: 3000, }, build: { target: "esnext" }, base: `` } satisfies
	UserConfigExport
