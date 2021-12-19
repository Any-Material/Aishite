type Unit = number | string | "inherit" | "initial" | "unset" | "auto";

function Unit(value: number, type: Nullable<string> = "px"): typeof type extends null ? number : string {
	if (type === null) {
		// @ts-ignore
		return value;
	}
	return value + type;
}

export default Unit;
