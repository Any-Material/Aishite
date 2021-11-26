import CSS from "csstype";

type Global = "inherit" | "initial" | "unset";

declare module "csstype" {
	interface Properties {
		WebkitAppRegion?: Global | "drag" | "no-drag";
	}
}
