Object.defineProperty(Array.prototype, "last", {
	get: function last() {
		return (this as any[])[(this as any[]).length - 1];
	}
});

Object.defineProperty(Array.prototype, "first", {
	get: function first() {
		return (this as any[])[0];
	}
});


Array.prototype.skip = function (count: number) {
	// return this.filter((value, index) => { return index >= count });
	return this.slice(count);
}

Array.prototype.take = function (count: number) {
	// return this.filter((value, index) => { return index < count });
	return this.slice(0, count);
}

Array.prototype.add = function <T>(...args: T[]) {
	for (const arg of args) {
		this[this.length] = arg;
	}
	return this;
}

Array.prototype.match = function <T>(element: T) {
	for (let index = 0; index < this.length; index++) {
		if (this[index] === element) {
			return index;
		}
	}
	return NaN;
}

Array.prototype.contains = function <T>(element: T) {
	return !isNaN(this.match(element));
}

ArrayBuffer.prototype.skip = function (count: number) {
	return this.slice(count);
}

ArrayBuffer.prototype.take = function (count: number) {
	return this.slice(0, count);
}

Number.prototype.clamp = function (minimum: number, maximum: number) {
	return Math.min(Math.max(this as number, minimum), maximum);
}

RegExp.prototype.match = function (string: string) {
	return this.test(string) ? new RegExpCapture({ groups: this.exec(string)! }) : null;
}

export class RegExpCapture {
	private readonly groups: string[];

	constructor(args: {
		groups: string[];
	}) {
		this.groups = args.groups;
	}
	public group(index: number) {
		return this.groups[index] ?? null;
	}
}

window.random = function (minimum: number, maximum: number, type: "integer" | "double" = "integer") {
	switch (type) {
		case "integer": {
			return Math.floor(Math.random() * (maximum - minimum + 1.0)) + minimum;
		}
		case "double": {
			return Math.random() * (maximum - minimum) + minimum;
		}
	}
}

window.inline = function (object: Record<string, boolean>) {
	const array: Array<string> = [];

	for (const key in object) {
		if (object[key]) {
			array.add(key);
		}
	}
	return array.join("\u0020");
}

window.devide = function (text: string, index: number): [string, string] {
	return [text.substring(0, index), text.substring(index)];
}

window.until = function (condition: () => boolean, duration: number = 100) {
	return new Promise<void>(async (resolve, reject) => {
		(function recursive() {
			if (condition()) {
				return resolve();
			}
			setTimeout(() => {
				return recursive();
			},
			duration);
		})();
	});
}
